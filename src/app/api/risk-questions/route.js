import { NextResponse } from "next/server";
import axios from "axios";
import { ConnectDB } from "@/lib/db/ConnectDB";

export async function GET(request) {
  try {
    await ConnectDB();
    // 3️⃣ Fetch fresh questions from external API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DATA_API}/api/open-apis/risk-questions?apikey=${process.env.NEXT_PUBLIC_API_KEY}`
    );
    const fetchedQuestions = response.data;

    // 4️⃣ Transform marks
    const transformedQuestions = fetchedQuestions.map((q) => {
      const transformedAnswers = q.answers.map((a) => {
        let newMarks = a.marks;
        if (a.marks === 1) newMarks = 2;
        else if (a.marks === 2) newMarks = 4;
        else if (a.marks === 3) newMarks = 6;
        else if (a.marks === 4) newMarks = 8;
        else if (a.marks === 5) newMarks = 10;

        return { ...a, marks: newMarks };
      });

      return {
        question: q.question,
        answers: transformedAnswers,
        status: false, // default inactive
      };
    });

    return NextResponse.json(transformedQuestions, { status: 200 });
  } catch (error) {
    console.error("Error fetching risk questions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
