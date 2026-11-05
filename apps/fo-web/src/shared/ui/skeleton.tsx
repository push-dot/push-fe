export const LOADING_NAME = '불러오는 중'

const Skeleton = ({ rows }: { rows: number }) => (
  <div className="skeleton" aria-busy="true">
    <span className="sr-only">{LOADING_NAME}</span>
    {Array.from({ length: rows }, (_, index) => (
      <span key={index} className="skeleton-block" />
    ))}
  </div>
)

export default Skeleton
