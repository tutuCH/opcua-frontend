const warningsList = ['警告', '注意', '警示', '危險'];
const descriptionsList = [
  '溫度過高',
  '壓力過低',
  '操作異常',
  '系統不穩',
  '維護需求',
  '能耗異常',
  '電壓波動',
  '設備故障',
];
const severityList = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const demoWarnings = Array.from({ length: 15 }, (_, i) => {
  // Generate a timestamp, subtracting i minutes from a fixed starting date.
  const baseDate = new Date('2021-01-01T12:00:00');
  const timestamp = new Date(baseDate.getTime() - i * 60000)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);

  // Randomly select values from each array.
  const warning = warningsList[Math.floor(Math.random() * warningsList.length)];
  const description = descriptionsList[Math.floor(Math.random() * descriptionsList.length)];
  const severity = severityList[Math.floor(Math.random() * severityList.length)];

  return {
    id: i + 1,
    warning,
    description,
    severity,
    timestamp,
    machine: `機器${(i % 3) + 1}`, // Cycles through 機器1, 機器2, 機器3
    factory: `工廠${(i % 2) + 1}`,  // Cycles through 工廠1, 工廠2
  };
});
