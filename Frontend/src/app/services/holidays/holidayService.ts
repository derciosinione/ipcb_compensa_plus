export interface CalendarHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: "Public Holiday" | "Institutional" | "Break";
  color?: string;
}

export const getDefaultHolidays = (): CalendarHoliday[] => [
  {
    id: "holiday-christmas",
    date: "2025-12-25",
    name: "Christmas Day",
    type: "Public Holiday",
  },
  {
    id: "holiday-newyear",
    date: "2026-01-01",
    name: "New Year's Day",
    type: "Public Holiday",
  },
  {
    id: "holiday-carnival",
    date: "2026-02-16",
    name: "Carnival Break",
    type: "Institutional",
  },
];

export const getHolidays = (): CalendarHoliday[] => {
  if (typeof window === "undefined") return getDefaultHolidays();
  const stored = localStorage.getItem("compensa_holidays");
  if (!stored) {
    const defaults = getDefaultHolidays();
    localStorage.setItem("compensa_holidays", JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultHolidays();
  }
};

export const saveHolidays = (holidays: CalendarHoliday[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("compensa_holidays", JSON.stringify(holidays));
  window.dispatchEvent(new Event("compensa_holidays_updated"));
};

export const parseCSV = (text: string): Omit<CalendarHoliday, "id">[] => {
  const lines = text.split(/\r?\n/);
  const parsed: Omit<CalendarHoliday, "id">[] = [];

  let headers = ["name", "date", "type"];
  let startIndex = 0;
  
  if (
    lines.length > 0 &&
    (lines[0].toLowerCase().includes("date") || lines[0].toLowerCase().includes("name"))
  ) {
    headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    startIndex = 1;
  }

  const nameCol = headers.findIndex((h) => h.includes("name") || h.includes("title"));
  const dateCol = headers.findIndex((h) => h.includes("date") || h.includes("day"));
  const typeCol = headers.findIndex((h) => h.includes("type") || h.includes("category"));

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length < 2) continue;

    const name = cols[nameCol !== -1 ? nameCol : 0] || "Holiday";
    let dateStr = cols[dateCol !== -1 ? dateCol : 1] || "";
    let type: CalendarHoliday["type"] = "Public Holiday";

    const typeStr = cols[typeCol !== -1 ? typeCol : 2]?.toLowerCase() || "";
    if (typeStr.includes("inst")) {
      type = "Institutional";
    } else if (typeStr.includes("break") || typeStr.includes("vacation") || typeStr.includes("férias")) {
      type = "Break";
    }

    try {
      const dObj = new Date(dateStr);
      if (!isNaN(dObj.getTime())) {
        dateStr = dObj.toISOString().split("T")[0];
        parsed.push({ name, date: dateStr, type });
      }
    } catch {
      // ignore
    }
  }
  return parsed;
};

export const parseICS = (text: string): Omit<CalendarHoliday, "id">[] => {
  const parsed: Omit<CalendarHoliday, "id">[] = [];
  
  // Custom iCalendar parser
  const eventBlocks = text.split("BEGIN:VEVENT");
  if (eventBlocks.length <= 1) return parsed;
  
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split("END:VEVENT")[0];
    
    // Extract SUMMARY
    const summaryMatch = block.match(/SUMMARY:(.*)/i);
    const name = summaryMatch ? summaryMatch[1].trim() : "Holiday";
    
    // Extract DTSTART
    const dtstartMatch =
      block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/i) ||
      block.match(/DTSTART(?:;VALUE=DATE)?:(\d{4}-\d{2}-\d{2})/i) ||
      block.match(/DTSTART:(\d{8}T\d{6})/i);
      
    if (dtstartMatch) {
      const rawDate = dtstartMatch[1];
      let dateStr = "";
      
      if (rawDate.includes("-")) {
        dateStr = rawDate.slice(0, 10);
      } else if (rawDate.length >= 8) {
        const y = rawDate.slice(0, 4);
        const m = rawDate.slice(4, 6);
        const d = rawDate.slice(6, 8);
        dateStr = `${y}-${m}-${d}`;
      }
      
      if (dateStr) {
        let type: CalendarHoliday["type"] = "Public Holiday";
        const lowerName = name.toLowerCase();
        
        if (
          lowerName.includes("break") ||
          lowerName.includes("vacation") ||
          lowerName.includes("férias") ||
          lowerName.includes("interrupção")
        ) {
          type = "Break";
        } else if (
          lowerName.includes("institutional") ||
          lowerName.includes("tolerância")
        ) {
          type = "Institutional";
        }
        
        parsed.push({ name, date: dateStr, type });
      }
    }
  }
  return parsed;
};
