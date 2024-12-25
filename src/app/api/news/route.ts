import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(news);
}

export async function POST(request: Request) {
  //  search news by title or author , date

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const parseDate = (dateString: string) => {
    const formats = ["yyyy-MM-dd", "MM-dd-yyyy", "MM/dd/yyyy", "yyyy/MM/dd"];
    for (const format of formats) {
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    return null;
  };

  const parsedDate = parseDate(search);

  console.log(parsedDate);

  const news = await prisma.news.findMany({
    where: {
      OR: [
        { title: { contains: search } },
        { author: { contains: search } },
        parsedDate
          ? {
              createdAt: {
                gte: parsedDate.toISOString(),
                lte: parsedDate.toISOString(),
              },
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(news);
}
