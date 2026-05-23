using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Linq;

class ProcessCsv
{
    static void Main()
    {
        string inputCsv = @"C:\Users\Chaitya\Documents\final data compare between ss n sp.csv";
        string outputCsv = @"C:\Users\Chaitya\Documents\final_sorted_deduplicated.csv";

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

        string header = lines[0];
        List<string[]> rows = new List<string[]>();

        for (int i = 1; i < lines.Count; i++)
        {
            string line = lines[i];
            if (string.IsNullOrWhiteSpace(line)) continue;
            rows.Add(ParseCsvLine(line));
        }

        Console.WriteLine(string.Format("Total rows read: {0}", rows.Count));

        Console.WriteLine("Removing duplicates based on MasterId1...");
        HashSet<string> seenMasterIds = new HashSet<string>();
        List<string[]> uniqueRows = new List<string[]>();

        foreach (var row in rows)
        {
            if (row.Length == 0) continue;
            string masterId = row[0].Trim();
            if (!seenMasterIds.Contains(masterId))
            {
                seenMasterIds.Add(masterId);
                uniqueRows.Add(row);
            }
        }

        Console.WriteLine(string.Format("Rows remaining after deduplication: {0}", uniqueRows.Count));

        Console.WriteLine("Sorting by BookName, Author, Publisher...");
        var sortedRows = uniqueRows.OrderBy(r => r.Length > 1 ? r[1] : "")
                                   .ThenBy(r => r.Length > 3 ? r[3] : "")
                                   .ThenBy(r => r.Length > 8 ? r[8] : "")
                                   .ToList();

        Console.WriteLine("Saving sorted and deduplicated CSV...");
        using (StreamWriter sw = new StreamWriter(outputCsv, false, Encoding.UTF8))
        {
            sw.Write("\uFEFF");
            sw.WriteLine(header);
            foreach (var row in sortedRows)
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
