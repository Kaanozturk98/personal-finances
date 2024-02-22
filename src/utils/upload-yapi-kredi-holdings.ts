export const mergeRows = (rows: string[][]): string[][] => {
  // Initialize an array to hold the merged rows
  let mergedRows: string[][] = [];
  // Initialize a variable to hold the current merged row
  let currentMergedRow: string[] = [];

  // Iterate over each row starting from index 1 to skip the header
  rows.slice(2).forEach((row) => {
    if (row[0]) {
      // Check if 'Hesap No' column is not empty
      if (currentMergedRow.length > 0) {
        // Push the previous merged row to the array
        mergedRows.push(currentMergedRow);
      }
      // Start a new merged row with the current row's data
      currentMergedRow = [...row];
    } else {
      // Merge current row with the currentMergedRow
      row.forEach((cell, index) => {
        if (cell.trim()) {
          // Only add non-empty cells to the merged row, separated by space
          currentMergedRow[index] += ` ${cell.trim()}`;
        }
      });
    }
  });

  // Don't forget to add the last merged row if it exists
  if (currentMergedRow.length > 0) {
    mergedRows.push(currentMergedRow);
  }

  // Prepend the header rows to the mergedRows array
  mergedRows.unshift(rows[0], rows[1]);

  return mergedRows;
};
