using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Linq;

class StackCsv
{
    static void Main()
    {
        string inputCsv = @"C:\Users\Chaitya\Documents\final data compare between ss n sp.csv";
        string outputCsv = @"C:\Users\Chaitya\Documents\final_stacked_data.csv";

        if (!File.Exists(inputCsv))
        {
            Console.WriteLine("Input CSV not found at " + inputCsv);
            return;
        }

        Console.WriteLine("Reading CSV...");
        
        List<string> lines = new List<string>();
        using (FileStream fs = new FileStream(inputCsv, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
        using (StreamReader sr = new StreamReader(fs, Encoding.Default))
        {
            string line;
            while ((line = sr.ReadLine()) != null)
            {
                lines.Add(line);
            }
        }

        if (lines.Count == 0) return;

        List<string[]> rows = new List<string[]>();
        for (int i = 1; i < lines.Count; i++) // Skip header
        {
            if (string.IsNullOrWhiteSpace(lines[i])) continue;
            rows.Add(ParseCsvLine(lines[i]));
        }

        Console.WriteLine(string.Format("Total rows read: {0}", rows.Count));

        List<string[]> stackedRows = new List<string[]>();
        HashSet<string> seenMasterId1 = new HashSet<string>();

        foreach (var row in rows)
        {
            string[] fullRow = new string[18];
            for (int i = 0; i < Math.Min(row.Length, 18); i++) fullRow[i] = row[i];

            string masterId1 = fullRow[0] != null ? fullRow[0].Trim() : "";
            string masterId2 = fullRow[9] != null ? fullRow[9].Trim() : "";

            if (!string.IsNullOrEmpty(masterId1) && !seenMasterId1.Contains(masterId1))
            {
                seenMasterId1.Add(masterId1);
                string[] table1Row = new string[9];
                Array.Copy(fullRow, 0, table1Row, 0, 9);
                stackedRows.Add(table1Row);
            }

            if (!string.IsNullOrEmpty(masterId2))
            {
                string[] table2Row = new string[9];
                Array.Copy(fullRow, 9, table2Row, 0, 9);
                stackedRows.Add(table2Row);
            }
        }

        Console.WriteLine(string.Format("Stacked into {0} total rows.", stackedRows.Count));

        Console.WriteLine("Saving stacked CSV...");
        using (StreamWriter sw = new StreamWriter(outputCsv, false, Encoding.UTF8))
        {
            sw.Write("\uFEFF");
            sw.WriteLine("MasterId,BookName,Part,Author,Editor,Tikakar,Translater,Language,Publisher");
            foreach (var row in stackedRows)
            {
                sw.WriteLine(string.Join(",", row.Select(c => EscapeCsv(c))));
            }
        }

        Console.WriteLine("Done! Saved to " + outputCsv);
    }

    static string[] ParseCsvLine(string line)
    {
        List<string> result = new List<string>();
        bool inQuotes = false;
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];
            if (c == '\"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '\"')
                {
                    sb.Append('\"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(sb.ToString());
                sb.Clear();
            }
            else
            {
                sb.Append(c);
            }
        }
        result.Add(sb.ToString());
        return result.ToArray();
    }

    static string EscapeCsv(string value)
    {
        if (value == null) return "";
        value = value.Replace("\"", "\"\"");
        if (value.Contains(",") || value.Contains("\"") || value.Contains("\n") || value.Contains("\r"))
        {
            return "\"" + value + "\"";
        }
        return value;
    }
}
