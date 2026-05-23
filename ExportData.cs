using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Linq;

class ExportData
{
    static void Main()
    {
        string sqlFile = @"C:\Users\Chaitya\Downloads\shrutseva_live.sql";
        string csvFile = @"C:\Users\Chaitya\Downloads\shrutseva_unique_books.csv";

        if (!File.Exists(sqlFile))
        {
            Console.WriteLine("ERROR: SQL file not found at " + sqlFile);
            return;
        }

        Console.WriteLine("Reading SQL file...");

        List<string> columns = new List<string>();
        List<string[]> rows = new List<string[]>();
        bool inMasterDataCreate = false;

        using (StreamReader sr = new StreamReader(sqlFile, Encoding.UTF8))
        {
            string line;
            while ((line = sr.ReadLine()) != null)
            {
                if (line.StartsWith("CREATE TABLE `MasterData`") || line.StartsWith("CREATE TABLE IF NOT EXISTS `MasterData`"))
                {
                    inMasterDataCreate = true;
                    continue;
                }

                if (inMasterDataCreate)
                {
                    if (line.StartsWith(")"))
                    {
                        inMasterDataCreate = false;
                        continue;
                    }
                    line = line.Trim();
                    if (line.StartsWith("`"))
                    {
                        int endQuote = line.IndexOf("`", 1);
                        if (endQuote > 1)
                        {
                            columns.Add(line.Substring(1, endQuote - 1));
                        }
                    }
                }

                if (line.StartsWith("INSERT INTO `MasterData`") || line.StartsWith("INSERT INTO MasterData "))
                {
                    int valuesIdx = line.IndexOf("VALUES ");
                    if (valuesIdx == -1) valuesIdx = line.IndexOf("VALUES");
                    if (valuesIdx > -1)
                    {
                        string data = line.Substring(valuesIdx + 6).Trim();
                        ParseInsertData(data, rows);
                    }
                }
            }
        }

        Console.WriteLine($"Extracted {columns.Count} columns and {rows.Count} rows.");

        int nameIdx = columns.FindIndex(c => c.Equals("book_name", StringComparison.OrdinalIgnoreCase));
        int authorIdx = columns.FindIndex(c => c.Equals("author", StringComparison.OrdinalIgnoreCase));
        int pubIdx = columns.FindIndex(c => c.Equals("publisher", StringComparison.OrdinalIgnoreCase));

        if (nameIdx == -1) nameIdx = 0; 

        Console.WriteLine("Sorting data...");
        var sortedRows = rows.OrderBy(r => nameIdx < r.Length ? r[nameIdx] : "")
                             .ThenBy(r => authorIdx > -1 && authorIdx < r.Length ? r[authorIdx] : "")
                             .ThenBy(r => pubIdx > -1 && pubIdx < r.Length ? r[pubIdx] : "")
                             .ToList();

        Console.WriteLine("Writing CSV...");
        using (StreamWriter sw = new StreamWriter(csvFile, false, new UTF8Encoding(true)))
        {
            sw.WriteLine(string.Join(",", columns.Select(c => EscapeCsv(c))));
            foreach (var r in sortedRows)
            {
                sw.WriteLine(string.Join(",", r.Select(v => EscapeCsv(v))));
            }
        }

        Console.WriteLine("Done! Saved to " + csvFile);
    }

    static void ParseInsertData(string data, List<string[]> rows)
    {
        List<string> currentRow = new List<string>();
        StringBuilder currentValue = new StringBuilder();
        bool inString = false;
        bool inTuple = false;
        bool escaped = false;

        for (int i = 0; i < data.Length; i++)
        {
            char c = data[i];

            if (!inTuple)
            {
                if (c == '(')
                {
                    inTuple = true;
                    currentRow = new List<string>();
                    currentValue.Clear();
                }
                else if (c == ';')
                {
                    break;
                }
                continue;
            }

            if (escaped)
            {
                currentValue.Append(c);
                escaped = false;
                continue;
            }

            if (c == '\\')
            {
                escaped = true;
                continue;
            }

            if (c == '\'')
            {
                if (inString && i + 1 < data.Length && data[i + 1] == '\'')
                {
                    currentValue.Append('\'');
                    i++;
                }
                else
                {
                    inString = !inString;
                }
                continue;
            }

            if (!inString)
            {
                if (c == ',')
                {
                    currentRow.Add(currentValue.ToString());
                    currentValue.Clear();
                    continue;
                }
                else if (c == ')')
                {
                    currentRow.Add(currentValue.ToString());
                    rows.Add(currentRow.ToArray());
                    inTuple = false;
                    continue;
                }
            }

            currentValue.Append(c);
        }
    }

    static string EscapeCsv(string value)
    {
        if (value == null) return "";
        if (value == "NULL") return "";
        value = value.Replace("\"", "\"\"");
        if (value.Contains(",") || value.Contains("\"") || value.Contains("\n") || value.Contains("\r"))
        {
            return "\"" + value + "\"";
        }
        return value;
    }
}
