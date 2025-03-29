import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/actions/general.action";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await createFeedback(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error creating feedback:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
} 