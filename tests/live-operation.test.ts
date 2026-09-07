import { it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { request, type Operation } from "@/shared/api";
import { useSession } from "@/shared/auth";

it.skipIf(!process.env.PUSH_LIVE_EXPORT)(
  "resumes an import requiring user text without fabricating extracted evidence",
  async () => {
    const token = process.env.DEV_AUTH_TOKEN;
    if (!token) throw new Error("Set DEV_AUTH_TOKEN");
    useSession.setState({
      apiUrl: process.env.PUSH_API_URL || "http://127.0.0.1:8080/api/v1",
      accessToken: token,
      refreshToken: "",
      accountId: "",
    });
    const pdf = await PDFDocument.create();
    pdf.addPage();
    const upload = new FormData();
    upload.append(
      "file",
      new Blob([(await pdf.save()) as Uint8Array<ArrayBuffer>], {
        type: "application/pdf",
      }),
      "empty-scan.pdf",
    );
    upload.append("kind", "RESUME");
    const source = await request<{ id: string }>("sources", "POST", upload);
    let operation = await request<Operation>("career-evidence/import", "POST", {
      sourceId: source.id,
      format: "PDF",
    });
    const wait = async () => {
      for (
        let i = 0;
        i < 20 && ["QUEUED", "RUNNING"].includes(operation.status);
        i++
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        operation = await request<Operation>(`operations/${operation.id}`);
      }
    };
    await wait();
    expect(operation.status).toBe("NEEDS_INPUT");
    const fields = Object.fromEntries(
      (operation.inputRequest?.fields || []).map((field) => [
        field.name,
        "사용자가 확인한 경력 원문: React 프로젝트 구현",
      ]),
    );
    operation = await request<Operation>(
      `operations/${operation.id}/input`,
      "POST",
      { fields },
    );
    await wait();
    expect(operation.status).toBe("SUCCEEDED");
    expect(JSON.stringify(operation.result)).toContain(
      "사용자가 확인한 경력 원문",
    );
  },
  30000,
);
