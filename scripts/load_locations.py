"""
Loads 2_India_Fully_Linked_PC_AC_Mandal_Village.xlsx into Postgres,
re-numbering codes per parent so the SSPPAAMMVVV membership-ID widths fit.

Run once:
    pip install openpyxl "psycopg[binary]" python-dotenv
    python scripts/load_locations.py
"""
import os, openpyxl, psycopg
from collections import defaultdict
from dotenv import load_dotenv; load_dotenv()

XLSX = os.environ.get("LOCATIONS_XLSX", "2_India_Fully_Linked_PC_AC_Mandal_Village.xlsx")
DSN  = os.environ["DATABASE_URL"]

wb = openpyxl.load_workbook(XLSX, read_only=True)
ws = wb["FULLY_LINKED"]
rows = ws.iter_rows(values_only=True)
header = next(rows)
idx = {h: i for i, h in enumerate(header)}
def g(r, k): return r[idx[k]]

state_id, pc_id, ac_id, md_id = {}, {}, {}, {}
pc_seq, ac_seq, md_seq, vl_seq = defaultdict(int), defaultdict(int), defaultdict(int), defaultdict(int)

with psycopg.connect(DSN) as cx, cx.cursor() as c:
    for i, r in enumerate(rows, 1):
        s_raw = int(g(r, "State_Code")); s_name = g(r, "State_Name")
        if s_raw not in state_id:
            c.execute(
                "insert into states(state_code,raw_code,name) values(%s,%s,%s) "
                "on conflict(raw_code) do update set name=excluded.name returning id",
                (f"{s_raw:02d}", s_raw, s_name))
            state_id[s_raw] = c.fetchone()[0]
        sid = state_id[s_raw]

        pc_raw = int(g(r, "PC_No")); pc_name = g(r, "PC_Name"); key = (sid, pc_raw)
        if key not in pc_id:
            pc_seq[sid] += 1
            c.execute(
                "insert into parliament_constituencies(state_id,pc_code,raw_pc_no,name) "
                "values(%s,%s,%s,%s) returning id",
                (sid, f"{pc_seq[sid]:02d}", pc_raw, pc_name))
            pc_id[key] = c.fetchone()[0]
        pid = pc_id[key]

        ac_raw = int(g(r, "AC_No")); ac_name = g(r, "AC_Name"); key = (pid, ac_raw)
        if key not in ac_id:
            ac_seq[pid] += 1
            c.execute(
                "insert into assembly_constituencies(pc_id,ac_code,raw_ac_no,name) "
                "values(%s,%s,%s,%s) returning id",
                (pid, f"{ac_seq[pid]:02d}", ac_raw, ac_name))
            ac_id[key] = c.fetchone()[0]
        aid = ac_id[key]

        md_raw = int(g(r, "AC_Mandal_Code")); md_name = g(r, "AC_Mandal_Name"); key = (aid, md_raw)
        if key not in md_id:
            md_seq[aid] += 1
            c.execute(
                "insert into mandals(ac_id,mandal_code,raw_mandal_code,name) "
                "values(%s,%s,%s,%s) returning id",
                (aid, f"{md_seq[aid]:02d}", md_raw, md_name))
            md_id[key] = c.fetchone()[0]
        mid = md_id[key]

        vl_raw = int(g(r, "Village_Code")); vl_name = g(r, "Village_Name")
        census = g(r, "Village_Census_Code")
        vl_seq[mid] += 1
        c.execute(
            "insert into villages(mandal_id,village_code,raw_village_code,name,census_code) "
            "values(%s,%s,%s,%s,%s) on conflict do nothing",
            (mid, f"{vl_seq[mid]:03d}", vl_raw, vl_name, str(census) if census else None))

        if i % 5000 == 0:
            cx.commit(); print(f"rows: {i:,}")
    cx.commit()
print("done")
