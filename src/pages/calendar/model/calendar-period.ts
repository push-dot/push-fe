export const monthPeriod = (month: string) => {
  const [year, index] = month.split("-").map(Number);
  return {
    from: new Date(year, index - 1, 1),
    to: new Date(year, index, 1),
    days: new Date(year, index, 0).getDate(),
  };
};
export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const localDateTime = (value: string) => {
  const date = new Date(value);
  return `${dateKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
