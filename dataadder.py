import os
import psycopg2
import tkinter as tk
from tkinter import ttk, messagebox
from dotenv import load_dotenv

# =====================================================
# LOAD ENV
# =====================================================
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL missing in .env")

# =====================================================
# SAMPLE DATA (OPTIONAL HELPERS)
# =====================================================
SAMPLE_MACHINES = {
    "machine-1": {
        "name": "CNC Machine 01",
        "status": "running",
        "metrics": [4582, 47, 4535, 10256, 92.3, 87.5],
        "time": [6.5, 0.5, 0.75, 0.25, "06:00", "14:00"]
    },
    "machine-2": {
        "name": "Assembly Line 02",
        "status": "idle",
        "metrics": [2847, 89, 2758, 31259, 78.4, 72.1],
        "time": [5.2, 1.0, 1.5, 0.3, "06:00", "14:00"]
    },
    "machine-3": {
        "name": "Packaging Unit 03",
        "status": "fault",
        "metrics": [1205, 156, 1049, 129461, 45.2, 38.7],
        "time": [3.0, 2.5, 1.0, 1.5, "06:00", "14:00"]
    }
}

# =====================================================
# DB CONNECTION
# =====================================================
def get_conn():
    return psycopg2.connect(DATABASE_URL)

# =====================================================
# SAVE / UPSERT MACHINE
# =====================================================
def save_machine():
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("""
        INSERT INTO machines (
          id, name, status,
          total_produced, total_rejects, accepted_pieces,
          ppm_rejection, efficiency, oee,
          on_time, off_time, idle_time, fault_time,
          shift_start, shift_end
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          status = EXCLUDED.status,
          total_produced = EXCLUDED.total_produced,
          total_rejects = EXCLUDED.total_rejects,
          accepted_pieces = EXCLUDED.accepted_pieces,
          ppm_rejection = EXCLUDED.ppm_rejection,
          efficiency = EXCLUDED.efficiency,
          oee = EXCLUDED.oee,
          on_time = EXCLUDED.on_time,
          off_time = EXCLUDED.off_time,
          idle_time = EXCLUDED.idle_time,
          fault_time = EXCLUDED.fault_time,
          shift_start = EXCLUDED.shift_start,
          shift_end = EXCLUDED.shift_end;
        """, (
            machine_var.get(),
            name_var.get(),
            status_var.get(),
            metrics_vars[0].get(),
            metrics_vars[1].get(),
            metrics_vars[2].get(),
            metrics_vars[3].get(),
            metrics_vars[4].get(),
            metrics_vars[5].get(),
            time_nums[0].get(),
            time_nums[1].get(),
            time_nums[2].get(),
            time_nums[3].get(),
            time_vars[0].get(),
            time_vars[1].get()
        ))

        conn.commit()
        conn.close()
        messagebox.showinfo("Success", "Machine saved successfully")

    except Exception as e:
        messagebox.showerror("Error", str(e))

# =====================================================
# LOAD SAMPLE DATA (ONLY IF EXISTS)
# =====================================================
def load_sample(*_):
    mid = machine_var.get()
    if mid not in SAMPLE_MACHINES:
        return  # allow manual entry

    m = SAMPLE_MACHINES[mid]
    name_var.set(m["name"])
    status_var.set(m["status"])

    for v, val in zip(metrics_vars, m["metrics"]):
        v.set(val)

    for v, val in zip(time_nums, m["time"][:4]):
        v.set(val)

    time_vars[0].set(m["time"][4])
    time_vars[1].set(m["time"][5])

# =====================================================
# CLEAR FORM (NEW MACHINE)
# =====================================================
def clear_form():
    machine_var.set("")
    name_var.set("")
    status_var.set("running")
    for v in metrics_vars + time_nums:
        v.set(0)
    time_vars[0].set("")
    time_vars[1].set("")

# =====================================================
# UI SETUP (SCROLLABLE)
# =====================================================
root = tk.Tk()
root.title("Machine Data Manager")
root.geometry("520x650")

canvas = tk.Canvas(root)
scrollbar = ttk.Scrollbar(root, orient="vertical", command=canvas.yview)
frame = ttk.Frame(canvas)

frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
canvas.create_window((0, 0), window=frame, anchor="nw")
canvas.configure(yscrollcommand=scrollbar.set)

canvas.pack(side="left", fill="both", expand=True)
scrollbar.pack(side="right", fill="y")

def field(label, var):
    ttk.Label(frame, text=label).pack(anchor="w", padx=10)
    ttk.Entry(frame, textvariable=var).pack(fill="x", padx=10, pady=2)

# =====================================================
# FIELDS
# =====================================================
machine_var = tk.StringVar()
machine_var.trace_add("write", load_sample)

ttk.Label(frame, text="Machine ID").pack(anchor="w", padx=10)
ttk.Combobox(
    frame,
    textvariable=machine_var,
    values=list(SAMPLE_MACHINES.keys()),
    state="normal"  # 🔥 editable
).pack(fill="x", padx=10)

name_var = tk.StringVar()
status_var = tk.StringVar(value="running")

field("Machine Name", name_var)

ttk.Label(frame, text="Status").pack(anchor="w", padx=10)
ttk.Combobox(
    frame,
    textvariable=status_var,
    values=["running", "idle", "off", "fault"],
    state="readonly"
).pack(fill="x", padx=10)

metrics_vars = [tk.DoubleVar() for _ in range(6)]
metrics_labels = [
    "Total Produced",
    "Total Rejects",
    "Accepted Pieces",
    "PPM Rejection",
    "Efficiency",
    "OEE"
]

for lbl, var in zip(metrics_labels, metrics_vars):
    field(lbl, var)

time_nums = [tk.DoubleVar() for _ in range(4)]
for lbl, var in zip(["On Time", "Off Time", "Idle Time", "Fault Time"], time_nums):
    field(lbl, var)

time_vars = [tk.StringVar() for _ in range(2)]
field("Shift Start (HH:MM)", time_vars[0])
field("Shift End (HH:MM)", time_vars[1])

# =====================================================
# BUTTONS
# =====================================================
ttk.Button(frame, text="Save Machine", command=save_machine).pack(pady=10)
ttk.Button(frame, text="New Machine", command=clear_form).pack(pady=5)

root.mainloop()
