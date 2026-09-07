import { Field } from "@/shared/ui";
import { useT } from "@/shared/config";
export type CompanySource = {
  sourceUrl: string;
  sourceText: string;
  accessedAt: string;
};
const localTime = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
export const CompanySourceFields = ({
  sources,
  onChange,
}: {
  sources: CompanySource[];
  onChange: (sources: CompanySource[]) => void;
}) => {
  const t = useT();
  const update = (index: number, change: Partial<CompanySource>) =>
    onChange(
      sources.map((source, position) =>
        position === index ? { ...source, ...change } : source,
      ),
    );
  return (
    <fieldset className="company-sources">
      <legend>
        {t(
          "회사 자료 · 사용자 제공 원문",
          "Company sources · User provided text",
        )}
      </legend>
      <p className="muted">
        {t(
          "직접 확인한 HTTPS 출처와 원문을 입력하세요. 자동 수집하거나 독립 검증한 자료가 아닙니다.",
          "Enter the HTTPS source and text you reviewed. These sources are user provided, not automatically collected or independently verified.",
        )}
      </p>
      {sources.map((row, index) => (
        <div key={index} className="panel">
          <Field
            label={t(
              `회사 자료 ${index + 1} 출처 URL`,
              `Company source ${index + 1} URL`,
            )}
          >
            <input
              type="url"
              pattern="https://.*"
              name="companySourceUrl"
              value={row.sourceUrl}
              onChange={(event) =>
                update(index, { sourceUrl: event.target.value })
              }
              required
            />
          </Field>
          <Field
            label={t(
              `회사 자료 ${index + 1} 원문`,
              `Company source ${index + 1} text`,
            )}
          >
            <textarea
              name="companySourceText"
              value={row.sourceText}
              onChange={(event) =>
                update(index, { sourceText: event.target.value })
              }
              maxLength={20000}
              required
            />
          </Field>
          <Field
            label={t(
              `회사 자료 ${index + 1} 확인 일시`,
              `Company source ${index + 1} accessed at`,
            )}
          >
            <input
              type="datetime-local"
              name="companySourceAccessedAt"
              value={row.accessedAt ? localTime(row.accessedAt) : ""}
              onChange={(event) =>
                update(index, {
                  accessedAt: event.target.value
                    ? new Date(event.target.value).toISOString()
                    : "",
                })
              }
              max={localTime(new Date().toISOString())}
              required
            />
          </Field>
          <button
            type="button"
            onClick={() =>
              onChange(sources.filter((_, position) => position !== index))
            }
          >
            {t("자료 삭제", "Remove source")}
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={sources.length >= 10}
        onClick={() =>
          onChange([
            ...sources,
            {
              sourceUrl: "",
              sourceText: "",
              accessedAt: new Date().toISOString(),
            },
          ])
        }
      >
        {t("회사 자료 추가", "Add company source")}
      </button>
    </fieldset>
  );
};
