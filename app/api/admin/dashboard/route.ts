import { NextRequest, NextResponse } from "next/server";
import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";

import { handleApiError, requireAdminUser } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const now = new Date();
    const monthStart = startOfMonth(now);
    const chartStart = startOfDay(subDays(now, 6));
    const chartEnd = endOfDay(now);

    const [
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      completedAppointments,
      totalCustomers,
      statusCounts,
      monthCompletedAppointments,
      recentAppointments,
      monthAppointmentsByService,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "APPROVED" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.customer.count(),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.appointment.findMany({
        where: {
          status: "COMPLETED",
          appointmentAt: { gte: monthStart },
        },
        select: {
          service: {
            select: {
              price: true,
            },
          },
        },
      }),
      prisma.appointment.findMany({
        where: {
          appointmentAt: {
            gte: chartStart,
            lte: chartEnd,
          },
        },
        select: {
          appointmentAt: true,
        },
      }),
      prisma.appointment.findMany({
        where: {
          appointmentAt: { gte: monthStart },
          status: { in: ["APPROVED", "COMPLETED"] },
        },
        select: {
          service: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      }),
    ]);

    const monthRevenue = monthCompletedAppointments.reduce((acc, current) => {
      return acc + Number(current.service.price);
    }, 0);

    const appointmentsByDayMap = new Map<string, number>();
    for (const day of eachDayOfInterval({ start: chartStart, end: startOfDay(now) })) {
      appointmentsByDayMap.set(format(day, "dd/MM"), 0);
    }

    for (const appointment of recentAppointments) {
      const key = format(appointment.appointmentAt, "dd/MM");
      appointmentsByDayMap.set(key, (appointmentsByDayMap.get(key) ?? 0) + 1);
    }

    const appointmentsByDay = Array.from(appointmentsByDayMap.entries()).map(
      ([date, total]) => ({
        date,
        total,
      }),
    );

    const statusDistribution = statusCounts.map((item) => ({
      status: item.status,
      total: item._count._all,
    }));

    const serviceMap = new Map<
      string,
      {
        service: string;
        appointments: number;
        revenue: number;
      }
    >();

    for (const appointment of monthAppointmentsByService) {
      const serviceName = appointment.service.name;
      const current = serviceMap.get(serviceName) ?? {
        service: serviceName,
        appointments: 0,
        revenue: 0,
      };

      current.appointments += 1;
      current.revenue += Number(appointment.service.price);
      serviceMap.set(serviceName, current);
    }

    const servicePerformance = Array.from(serviceMap.values()).sort(
      (a, b) => b.appointments - a.appointments,
    );

    return NextResponse.json({
      metrics: {
        totalAppointments,
        pendingAppointments,
        approvedAppointments,
        completedAppointments,
        totalCustomers,
        monthRevenue,
      },
      charts: {
        appointmentsByDay,
        statusDistribution,
        servicePerformance,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
