export const careerLabel = (career: { careerMin: number; careerMax: number | null }) =>
  career.careerMin === 0 && !career.careerMax ? '신입' : career.careerMax ? `${career.careerMin}–${career.careerMax}년` : `${career.careerMin}년+`

export const cardCareerLabel = (career: { careerMin: number; careerMax: number | null }) => {
  if (career.careerMin >= 10) return '10년+'
  if (career.careerMin >= 7) return '7년+'
  return careerLabel(career)
}
