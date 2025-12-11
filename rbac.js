/* rbac.js
   Client-side role-based UI & navigation guard for DaisySyete admin dashboard.
   - Reads `sessionStorage.adminUser` (set after login)
   - Hides nav links not allowed for the role
   - Wraps `navigateTo` to block unauthorized navigation
   - Exposes helpers: getCurrentAdmin, applyRolePermissions
*/

(function () {
  const ROLE_ALLOWED_VIEWS = {
    'super_admin': ['dashboard','raw-responses','compliance-reports','manage-questions','user-management','add-user-form'],
    'admin': ['dashboard','user-management','manage-questions','compliance-reports','add-user-form'],
    'data_analyst': ['dashboard','raw-responses','compliance-reports'],
    'survey_manager': ['dashboard','manage-questions']
  };

  function getCurrentAdmin() {
    try {
      const userJson = sessionStorage.getItem('adminUser');
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      console.warn('Failed to parse adminUser from sessionStorage', e);
      return null;
    }
  }

  function applyRolePermissions() {
    const admin = getCurrentAdmin();
    const role = admin && admin.role ? admin.role : null;
    const allowed = role && ROLE_ALLOWED_VIEWS[role] ? ROLE_ALLOWED_VIEWS[role] : [];

    // Hide/show nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const view = link.dataset.view;
      if (!view) return;
      if (!allowed.includes(view)) {
        link.style.display = 'none';
      } else {
        link.style.display = '';
      }
    });

    // Control Add User button visibility
    const addUserBtn = document.getElementById('showAddUserBtn');
    if (addUserBtn) {
      if (!allowed.includes('add-user-form')) addUserBtn.style.display = 'none';
      else addUserBtn.style.display = '';
    }

    // Replace header display name if present
    try {
      const headerName = document.querySelector('.header .admin-name') || document.querySelector('.header .admin');
      if (headerName && admin) headerName.textContent = admin.name || admin.email || '';
    } catch (e) {}
  }

  // Navigation guard wrapper
  function wrapNavigateTo() {
    // preserve original if exists
    const original = window.navigateTo;
    window.navigateTo = function(viewId) {
      const admin = getCurrentAdmin();
      const role = admin && admin.role ? admin.role : null;
      const allowed = role && ROLE_ALLOWED_VIEWS[role] ? ROLE_ALLOWED_VIEWS[role] : [];

      if (!allowed.includes(viewId)) {
        // show a temporary access denied message in the content area
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
          const prev = document.getElementById('accessDeniedMessage');
          if (prev) prev.remove();
          const msg = document.createElement('div');
          msg.id = 'accessDeniedMessage';
          msg.className = 'bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-4';
          msg.innerText = 'Access denied: you do not have permission to view this section.';
          contentArea.prepend(msg);
          setTimeout(()=> msg.remove(), 4000);
        }
        return;
      }

      if (typeof original === 'function') return original(viewId);
      // fallback safe behavior if original missing
      document.querySelectorAll('.page-content').forEach(c => c.classList.add('hidden'));
      const t = document.getElementById(viewId);
      if (t) t.classList.remove('hidden');
    };
  }

  // Public API
  window.rbac = {
    getCurrentAdmin,
    applyRolePermissions,
    ROLE_ALLOWED_VIEWS
  };

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    // wrap navigation if needed
    try { wrapNavigateTo(); } catch (e) { console.warn('RBAC: failed to wrap navigateTo', e); }
    // apply permissions if already logged in
    try { applyRolePermissions(); } catch (e) {}
  });
})();
