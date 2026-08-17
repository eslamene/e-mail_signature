// Prefill signature fields from ?employeeId=

function getEmployeeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('employeeId') || params.get('employeeid') || '').trim();
}

function findEmployee(employees, employeeId) {
  const needle = employeeId.toLowerCase();
  return employees.find((employee) => {
    const id = (employee.id || '').toLowerCase();
    const email = (employee.email || '').toLowerCase();
    const username = email.includes('@') ? email.split('@')[0] : '';
    return id === needle || email === needle || username === needle;
  });
}

function applyEmployeeFields(employee) {
  const fieldMap = {
    fullName: employee.fullName,
    jobTitle: employee.jobTitle,
    phone: employee.phone,
    website: employee.website,
    address: employee.address,
    rights1: employee.rights1,
    rights2: employee.rights2
  };

  Object.entries(fieldMap).forEach(([id, value]) => {
    if (value == null) return;
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  if (employee.email && window.setEmailFromAddress) {
    window.setEmailFromAddress(employee.email);
  }
}

async function applyEmployeeById(employeeId) {
  try {
    const res = await fetch('employees.json');
    if (!res.ok) {
      showToast('Could not load employee directory.', 'error');
      return false;
    }

    const data = await res.json();
    const employees = Array.isArray(data.employees) ? data.employees : [];
    const employee = findEmployee(employees, employeeId);

    if (!employee) {
      showToast(`Employee "${employeeId}" was not found.`, 'error');
      return false;
    }

    if (employee.template) {
      const templateSelect = document.getElementById('templateSelect');
      if (templateSelect) templateSelect.value = employee.template;
      if (window.applyTemplate) {
        await window.applyTemplate(employee.template);
      }
    }

    applyEmployeeFields(employee);
    if (window.updateSignature) window.updateSignature();
    showToast(`Prefill applied for ${employee.fullName}.`, 'success');
    return true;
  } catch (err) {
    console.error('Failed to prefill employee', err);
    showToast('Failed to prefill employee data.', 'error');
    return false;
  }
}

async function prefillFromUrl() {
  const employeeId = getEmployeeIdFromUrl();
  if (!employeeId) return false;
  return applyEmployeeById(employeeId);
}

window.applyEmployeeById = applyEmployeeById;
window.prefillFromUrl = prefillFromUrl;
