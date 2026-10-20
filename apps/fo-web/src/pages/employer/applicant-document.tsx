const ApplicantDocument = ({ title, content }: { title: string; content: string }) => (
  <li className="doc-row">
    <h2 className="h3">{title}</h2>
    <p className="b1">{content}</p>
  </li>
)

export default ApplicantDocument
