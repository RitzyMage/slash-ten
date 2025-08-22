export default function Indent(_: string, count: number) {
  const indentSpaces = Array.from({ length: count })
    .map((_) => "\t")
    .join("");
  return _.split("\n")
    .map((_) => `${indentSpaces}${_}`)
    .join("\n");
}
