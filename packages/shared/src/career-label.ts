export const careerLabel = (career: { careerMin: number; careerMax: number | null }) =>
  career.careerMin === 0 && !career.careerMax ? '신입' : career.careerMax ? `${career.careerMin}–${career.careerMax}년` : `${career.careerMin}년+`
