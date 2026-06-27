function getOrdinal(n) {
  if (n > 10 && n < 14) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

const formatFullDate = (dateString) => {
  const date = new Date(dateString);

  // Part 1: Month and Day
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const suffix = getOrdinal(day);

  // Part 2: Year and Time
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${month} ${day}${suffix}, ${year} ${time}`;
};

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);

  const units = [
    { label: 'y', value: 365 * 24 * 60 * 60 },
    { label: 'mo', value: 30 * 24 * 60 * 60 },
    { label: 'w', value: 7 * 24 * 60 * 60 },
    { label: 'd', value: 24 * 60 * 60 },
    { label: 'h', value: 60 * 60 },
    { label: 'min', value: 60 },
    { label: 's', value: 1 }
  ];

  let remaining = seconds;
  const parts = [];

  for (const unit of units) {
    const amount = Math.floor(remaining / unit.value);

    if (amount > 0) {
      parts.push(`${amount}${unit.label}`);
      remaining %= unit.value;

      if (parts.length === 2) break;
    }
  }

  return parts.length ? parts.join(' ') : '0s';
}

async function addPowerLog(isCharging) {
  let data;
  await $.post('https://lapmeasure.pythonanywhere.com/api/logs', { status: isCharging },
    {
      success: (res) => { data = res; },
      error: (err) => {
        console.log(err);
        data = { success: false };
      }
    }); return data;
}

async function sendStatusEmail(status) {
  await $.post('https://lapmeasure.pythonanywhere.com/api/send-mail', { status },
    {
      success: (res) => {
        console.log(res);
        return res
      },
      error: (err) => {
        console.log(err);
        return { success: false };
      }
    })
}

async function getLogs() {
  let data;
  await $.get('https://lapmeasure.pythonanywhere.com/api/logs',
    {
      success: (res) => { data = res.logs },
      error: (err) => {
        console.log(err);
        data = { success: false };
      },
    });
  return data;
}

if ('getBattery' in navigator) {
  navigator.getBattery().then((battery) => {
    // Helper function to dynamically modify the webpage

    const updateUI = async () => {
      const isCharging = battery.charging ? true : false;
      const res = await addPowerLog(isCharging);
      if (res.success) await sendStatusEmail(isCharging);
      const icon = $.select("#statusIcon");
      const status = $.select("#status");

      if (isCharging) {
        icon.innerText = "🔌";
        $.toggleClass(icon, 'bg-green-200');
        status.innerText = "Connected to power (Charging)";
        status.style.color = "green";
      } else {
        icon.innerText = "🔋";
        $.toggleClass(icon, 'bg-red-200');
        status.innerText = "Running on battery power";
        status.style.color = "red";
      }
    };

    // Run instantly when the page loads
    updateUI();

    // Listen and update instantly in real time when the cable is moved
    battery.addEventListener('chargingchange', updateUI);
  });
} else {
  document.getElementById('power-status').innerText = "Battery API not supported.";
}

$.ready(function () {
  const loading = $.select('.loading');
  $.fadeOut(loading);
});