# ArenaOS Authoritative Navigation Structure

This document outlines the corrected application flow and navigation hierarchy for every user persona.

## 1. 👤 Player Persona

### **Home**
*   **Upcoming Booking Card**: Next session details with action button.
    *   **Action**: Check-in (active during time window).
*   **Quick Book**: Shortcut to favorite/recent resources.
*   **Alerts**: Pending payments, expiring holds.

### **Book**
*   **Select Sport/Category**: Filter resources.
*   **Select Resource**: List view with capacity/mode.
*   **Select Date/Time**: Availability grid.
*   *(If Shared)* **Quantity Selection**: Number of seats/spots.
*   **Checkout**: Price breakdown.
*   **Payment**:
    *   **QR Screen**: Amount + Reference + Countdown Timer.
*   **Success**:
    *   **Booking Confirmed**.
    *   **Receipt**.
    *   **Booking Pass**: Entry QR code (separate from payment).

### **My Bookings**
*   **Upcoming**: List of future sessions.
    *   **Actions**: Check-in, Cancel (policy-aware), Reschedule.
*   **History**: Past sessions.

### **Packages**
*   **Balance View**: Credits remaining + expiry date.
*   **Buy Package**: List of membership/credit packs.
*   **Usage History**: Ledger of credit deductions.

### **Payments**
*   **Transaction History**: Receipts and invoices.
*   **Pending/Failed**: Retry payment flow.

### **Profile**
*   **Details**: Name, email, phone.
*   **Teams/Family**: (Optional) Managed sub-profiles.
*   **Notifications**: Preferences.

---

## 2. 💼 Staff Persona

### **Dashboard**
*   **Today's Schedule**: Timeline view.
*   **Alerts**:
    *   Pending payments (needing verification).
    *   Expiring holds.
    *   Potential no-shows.

### **New Walk-in**
*   **Booking Wizard**:
    *   Select Sport -> Resource -> Time.
    *   Customer Search (or Guest).
    *   Price Breakdown.
    *   **Generate QR**:
        *   **Cashier QR Screen**: Large QR + Status + Timer.
    *   **Confirm**: Manual override/cash payment confirmation.

### **Bookings**
*   **Search**: By Reference ID, Name, Date.
*   **Manage**:
    *   View Details.
    *   Reschedule.
    *   **Cancel**: Staff override with reason code.
    *   Mark No-Show.

### **Payments**
*   **Verify Status**: Check specific reference against Payment Provider.
*   **Manual Confirm**: Override payment status (requires reason).
*   **Flag for Review**: escalate issues.

### **Check-in**
*   **Scan Booking Pass**: Camera UI for Entry QR.
*   **Manual Search**: Lookup user/booking for check-in.
*   **Override**: Force check-in/out.

---

## 3. ⏱️ Trainer Persona

### **Home**
*   **Today's Sessions**: Quick access card.
*   **Quick Open**: Start next session immediately.

### **Sessions**
*   **Session List**: Calendar/List view.
*   **Session Detail**:
    *   **Roster**: List of trainees.
    *   **Attendance**: Mark Present/Absent/Late.
    *   **Notes**: Session log.
    *   **Complete**: Close session (deducts credits/finalizes).

### **Trainees**
*   **Directory**: List of assigned athletes.
*   **Profile**: Attendance history, progress notes, membership status.

### **Availability**
*   **Weekly Grid**: Mon-Sun scheduler.
*   **Block/Unblock**: Toggle availability slots.

---

## 4. 🛡️ Admin Persona (Venue Admin)

### **Branding**
*   **Identity**: Logo upload, Name.
*   **Theme**: Primary/Secondary colors.
*   **Preview**: Real-time mock of Player UI.

### **Resources**
*   **Management**: Add/Edit Resources.
    *   *Config*: Mode (Exclusive/Shared), Capacity, Images.
    *   *Operations*: Open hours, Maintenance blocks.
*   *(Note: Pricing is NOT here, it is in Pricing module)*.

### **Pricing**
*   **Rate Cards**:
    *   Peak vs Off-Peak rules.
    *   Day/Time specific rates.
    *   User-group specific rates (Member vs Guest).

### **Policies**
*   **Booking Rules**: Cancel window, Reschedule limits.
*   **Operations**:
    *   **GPS Radius**: Allowed check-in distance.
    *   **Check-in Window**: Time before/after slot.
    *   **No-Show**: Penalty configuration.

### **Trainers & Staff**
*   **User Management**: Add/Invite staff.
*   **Roles**: Assign permissions (Trainer/Staff/Admin).
*   **Assignments**: Link trainers to resources/sports.

### **Customers**
*   **Directory**: All players.
*   **Management**: Block user, Adjust credits, View history.

### **Reports**
*   **Financial**: Revenue, Refunds.
*   **Operational**: Utilization, No-shows, Peak hours.

### **Integrations**
*   **Payment/QR**: API Keys, Webhook URL configuration.
*   **Testing**: Generate Test QR.
*   **Logs**: API interaction logs.
