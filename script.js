document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('rsvpForm');
  const guestsInput = document.getElementById('guests');
  const feedback = document.getElementById('feedback');
  const guestDetailsContainer = document.getElementById('guestDetailsContainer');

  function renderGuestRows(count) {
    guestDetailsContainer.innerHTML = '';

    for (let i = 1; i <= count; i++) {
      const row = document.createElement('div');
      row.className = 'guest-row';

      const nameLabel = document.createElement('label');
      nameLabel.setAttribute('for', `guestName${i}`);
      nameLabel.textContent = `Guest ${i} Name`;

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.id = `guestName${i}`;
      nameInput.name = `guestName${i}`;
      nameInput.placeholder = `Guest ${i} name`;
      nameInput.required = true;

      row.append(nameLabel, nameInput);
      guestDetailsContainer.appendChild(row);
    }
  }

  function updateGuestRows() {
    let guests = Number(guestsInput.value);
    if (Number.isNaN(guests) || guests < 0) {
      guests = 0;
      guestsInput.value = '0';
    }
    if (guests > 10) {
      guests = 10;
      guestsInput.value = '10';
    }

    renderGuestRows(guests);
  }

  updateGuestRows();
  guestsInput.addEventListener('input', updateGuestRows);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const fullName = form.elements['name'].value.trim();
    const guests = Number(form.elements['guests'].value);
    const attend = form.elements['attend'].value;
    const message = form.elements['message'].value.trim();

    if (!fullName || guests < 0) {
      feedback.textContent = 'Please fill in your name and a valid number of guests.';
      feedback.style.color = '#b24545';
      return;
    }

    if (guests < 0 || guests > 10) {
      feedback.textContent = 'Guests must be between 0 and 10.';
      feedback.style.color = '#b24545';
      return;
    }

    const guestDetails = [];
    for (let i = 1; i <= guests; i++) {
      const guestName = form.elements[`guestName${i}`]?.value.trim();

      if (!guestName) {
        feedback.textContent = `Please provide the name for Guest ${i}.`;
        feedback.style.color = '#b24545';
        return;
      }

      guestDetails.push({
        name: guestName,
      });
    }

    const rsvpData = {
      fullName,
      guests,
      attend,
      message,
      guestDetails,
      time: new Date().toLocaleString(),
    };

    console.log('RSVP Submission:', rsvpData);

    form.reset();
    form.elements['attend'].value = 'Yes';

    feedback.textContent = `Thank you, ${fullName}! Your RSVP has been recorded. We look forward to seeing you.`;
    feedback.style.color = '#4a725b';

    setTimeout(() => {
      feedback.textContent = '';
    }, 6000);
  });
});