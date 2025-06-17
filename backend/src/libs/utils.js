function parseBoolean(value) {
  if (value === undefined) return undefined;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;

  return undefined; // hoặc throw new Error nếu muốn bắt buộc giá trị hợp lệ
}

module.exports = {
  parseBoolean,
};
