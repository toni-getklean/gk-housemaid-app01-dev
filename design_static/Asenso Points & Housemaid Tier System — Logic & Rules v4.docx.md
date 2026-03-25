# Asenso Points & Housemaid Tier System — Logic & Rules v4

**Status:** For Final Confirmation Before System Implementation  
**Purpose:** Single source of truth for app development and system behavior  

---

## 1. System Overview

The platform contains two connected but separate systems:

### A. Asenso Points System
- Earned from bookings and availability  
- Deducted due to violations  
- Used for certification enrollment  

**Does NOT determine tier directly**

### B. Certification → Housemaid Tier
- Determines pricing, earnings, priority  
- Based ONLY on completed certifications  

---

## 2. Asenso Points System

### 2.1 Points Earning

| Action | Regular | Plus | All-In |
|--------|--------:|-----:|-------:|
| Trial | 150 | 300 | 600 |
| One-time | 150 | 300 | 600 |
| Repeat | 150 | 300 | 600 |
| Flexi | 300 | 600 | 900 |
| Available no booking | 100 | - | - |

---

### 2.1.1 Availability Reward
+100 points if:
- Marked available
- No booking offers received
- Not suspended

---

## 3. Certification System

| Level | Description |
|------|------------|
| Entry | Basic SOP |
| Basic | Execution |
| Advanced | Specialized |
| Expert | Premium |

---

## 4. Tier Mapping

| Certification | Tier |
|--------------|------|
| Entry/Basic | Regular |
| Advanced | Plus |
| Expert | All-In |

---

## 5. Revenue Model
- Flat rate per booking
- Platform = Customer price - HM rate

---

## 7. Surge Pricing
+10% of HM rate (weekends & holidays)

---

## 8. NCR Pricing

### Whole Day
| Tier | Rate | Surge | Total |
|------|-----:|------:|------:|
| Regular | 650 | 65 | 715 |
| Plus | 740 | 74 | 814 |
| All-In | 1000 | 100 | 1100 |

### Half Day
| Tier | Rate | Surge | Total |
|------|-----:|------:|------:|
| Regular | 510 | 51 | 561 |
| Plus | 600 | 60 | 660 |
| All-In | 750 | 75 | 825 |

---

## 9. Cebu Pricing

### Whole Day
| Tier | Rate | Surge | Total |
|------|-----:|------:|------:|
| Regular | 540 | 54 | 594 |
| Plus | 630 | 63 | 693 |
| All-In | 890 | 89 | 979 |

### Half Day
| Tier | Rate | Surge | Total |
|------|-----:|------:|------:|
| Regular | 420 | 42 | 462 |
| Plus | 510 | 51 | 561 |
| All-In | 660 | 66 | 726 |

---

## 10. Cavite Pricing

### Whole Day
| Tier | Rate | Surge | Total |
|------|-----:|------:|------:|
| Regular | 600 | 60 | 660 |
| Plus | 690 | 69 | 759 |
| All-In | 950 | 95 | 1045 |

### Half Day
| Tier | Rate | Surge | Total |
|------|-----:|------:|------:|
| Regular | 460 | 46 | 506 |
| Plus | 550 | 55 | 605 |
| All-In | 700 | 70 | 770 |

---

## 11. Flexi Plan Pricing

| Plan | Price |
|------|------:|
| 1 Month | 1790 |
| 3 Months | 4990 |
| 6 Months | 5990 |
| 12 Months | 8990 |

- Same across all territories
- Not affected by surge
- Membership pricing (not HM rate)
