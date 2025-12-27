export function capitalizeFirstLetter(str) {
  if (!str) {
    return str; // Handle empty strings
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeEachWord(str) {
  if (!str) {
    return str;
  }
  return str
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}
