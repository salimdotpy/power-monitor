from datetime import timedelta

def mail_template(text, icon, time, duration):
    return f"""
<div style="background: #f2f2f2; padding: 10px;">
    <div style="background: white; padding: 1rem; padding-top: 2rem; border-radius: 10px; width: 100%;">
      <div
        style="width: 5rem; height: 5rem; background: #f9f9f9; border: 2px solid blue; border-radius: 50px; font-size: 3rem; margin: auto;">
        <div style="margin: auto; text-align: center; padding-top: 18px;">{icon}</div>
      </div>
      <p style="width: 100%; margin-top: 25px;">
        The device changed state to: <b>{text}</b> at <b>{time}</b>. Previous state lasted for
        <b>{duration}</b>.
      </p>
    </div>
  </div>
"""

def format_duration(interval: timedelta) -> str:

    """
    Converts a timedelta object into a shorthand string layout.
    Example output: '1mo, 3w, 2d, 10h, 15min, 30s'
    """
    if not interval or interval.total_seconds() <= 0:
        return "0s"

    total_seconds = int(interval.total_seconds())

    # Conversions in seconds (Month is approximated as 30 days)
    conversions = [
        ('y', 365 * 24 * 60 * 60),
        ('mo',  2592000),
        ('w',   604800),
        ('d',   86400),
        ('h',   3600),
        ('min', 60),
        ('s',   1)
    ]

    parts = []
    remainder = total_seconds

    # Extract components from largest to smallest
    for label, unit_seconds in conversions:
        value, remainder = divmod(remainder, unit_seconds)
        if value > 0:
            parts.append(f"{value}{label}")
            if len(parts) == 2:
                break

    # Join with a comma (or use a space " " depending on preference)
    return ", ".join(parts)
