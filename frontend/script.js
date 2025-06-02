let authToken = null
let id = null

const API_BASE_URL = "http://localhost:3000"

const loginBtn = document.getElementById("login")
const loginSection = document.getElementById("login-section")
const dashboardSection = document.getElementById("dashboard-section")
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const logoutBtn = document.getElementById("logout-btn1")
const userNameElement = document.getElementById("user-name")
const tabBtns = document.querySelectorAll(".tab-btn")
const navItems = document.querySelectorAll(".nav-item")
const toast = document.getElementById("toast")
const radios = document.querySelectorAll('input[name="account-type"]')

radios.forEach(radio => {
  radio.addEventListener('click', function() {
    if (this.value === "true") {
      document.getElementsByClassName("business-name")[0].classList.remove("hidden")
    } else {
      document.getElementsByClassName("business-name")[0].classList.add("hidden")
    }
    
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  // Setup hamburger menu toggle
  const hamburgerCheckbox = document.getElementById("check") || document.querySelector(".mobile-menu-toggle")
  const sidebar = document.querySelector(".sidebar")

  hamburgerCheckbox.addEventListener("change", function () {
    if (this.checked) {
      sidebar.classList.add("show-mobile")
    } else {
      sidebar.classList.remove("show-mobile")
    }
  })
  const storedToken = localStorage.getItem("authToken")
  let isAdmin = false
  if (storedToken) {
    authToken = storedToken
    isAdmin = await fetchUserData(null, localStorage.getItem("id"))
  }

  setupEventListeners(isAdmin)
})

function setupEventListeners(isAdmin) {
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab")
      switchTab(tabId, isAdmin)
    })
  })

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    isAdmin = await handleLogin()
  })

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()
    handleRegister()
  })

  logoutBtn.addEventListener("click", handleLogout)

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const pageId = item.getAttribute("data-page")
      switchPage(pageId, isAdmin)
    })
  })

  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllModals()
    })
  })

  window.addEventListener("click", (e) => {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
    })
  })

  document.getElementById("new-request-btn").addEventListener("click", () => {
    openModal("request-modal")
  })

  document.getElementById("request-form").addEventListener("submit", (e) => {
    e.preventDefault()
    console.log("Called")

    createSupportRequest()
  })

  document.getElementById("new-kb-btn").addEventListener("click", () => {
    openModal("new-kb-modal")
  })

  document.getElementById("kb-form").addEventListener("submit", (e) => {
    e.preventDefault()
    createKnowledgeBase(isAdmin)
  })

  document.querySelectorAll(".kb-filter").forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.getAttribute("data-filter")
      filterKnowledgeBase(filterValue)
    })
  })

  document.querySelectorAll(".part-filter").forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.getAttribute("data-filter")
      filterParts(filterValue)
    })
  })

  function filterParts(filter) {
    document.querySelectorAll(".part-filter").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`.part-filter[data-filter="${filter}"]`).classList.add("active")

    const parts = document.querySelectorAll(".parts-list .list-item")

    parts.forEach((part) => {
      const partName = part.querySelector(".list-item-title").textContent
      if (filter === "all" || partName.includes(filter)) {
        part.style.display = "flex"
      } else {
        part.style.display = "none"
      }
    })
  }

  document.getElementById("new-part-btn").addEventListener("click", () => {
    openModal("part-modal")
  })

  document.getElementById("part-form").addEventListener("submit", (e) => {
    e.preventDefault()
    createSparePart(isAdmin)
  })

  document.querySelectorAll(".view-part").forEach((btn) => {
    btn.addEventListener("click", () => {
      const partId = btn.getAttribute("data-id")
      viewPartDetails(partId)
    })
  })

  if (isAdmin) {
    document.querySelectorAll(".edit-part").forEach((btn) => {
      btn.addEventListener("click", () => {
        const partId = btn.getAttribute("data-id")
        editPart(partId, isAdmin)
      })
    })

    document.querySelectorAll(".delete-part").forEach((btn) => {
      btn.addEventListener("click", () => {
        const partId = btn.getAttribute("data-id")
        deletePart(partId, isAdmin)
      })
    })
  }

  document.getElementById("parts-search-btn").addEventListener("click", () => {
    const searchQuery = document.getElementById("parts-search").value
    searchParts(searchQuery)
  })

  document.getElementById("parts-search").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const searchQuery = e.target.value
      searchParts(searchQuery)
    }
  })

  document.getElementById("job-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const form = e.target
    console.log(form)

    if (form.dataset.mode === "edit-job-modal") {
      updateJob(form.dataset.jobId)
    } else {
      createJob(isAdmin)
    }
  })
  document.getElementById("new-job-btn").addEventListener("click", () => {
    openModal("job-modal")
    populateJobFormSelects()
  })

  document.getElementById("new-tech-btn").addEventListener("click", () => {
    openModal("tech-modal")
  })

  document.getElementById("tech-form").addEventListener("submit", (e) => {
    e.preventDefault()
    createTechnician(isAdmin)
  })

  // Close mobile menu when clicking on a nav item
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const hamburgerCheckbox = document.getElementById("check")
      hamburgerCheckbox.checked = false
      document.querySelector(".sidebar").classList.remove("show-mobile")
    })
  })
}

function switchTab(tabId, isAdmin) {
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })

  tabBtns.forEach((btn) => {
    btn.classList.remove("active")
  })

  document.getElementById(tabId).classList.add("active")
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active")
}

function switchPage(pageId, isAdmin) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active")
  })

  navItems.forEach((item) => {
    item.classList.remove("active")
  })

  document.getElementById(`${pageId}-page`).classList.add("active")
  document.querySelector(`[data-page="${pageId}"]`).classList.add("active")

  if (pageId === 'statistics') {
    document.getElementById('statistics-page').classList.add("statistics-page")
    document.getElementById('statistics-page').style.display = "flex"
    document.getElementById('statistics-page').style.flexDirection = "column"
  } else {
    document.getElementById('statistics-page').classList.remove("statistics-page")
    document.getElementById('statistics-page').style.display = "none"
  }
  console.log(pageId);
  

  loadPageData(pageId, isAdmin)
}

function loadPageData(pageId, isAdmin) {
  switch (pageId) {
    case "dashboard":
      loadDashboardData(isAdmin)
      break
    case "statistics":
      loadStatistics(isAdmin)
      break
    case "support-requests":
      loadSupportRequests(isAdmin)
      break
    case "knowledge-base":
      loadKnowledgeBase(isAdmin)
      break
    case "spare-parts":
      loadSpareParts(isAdmin)
      break
    case "job-scheduling":
      loadJobs(isAdmin)
      break
    case "technicians":
      loadTechnicians(isAdmin)
      break
    case "users":
      loadUsers(isAdmin)
      break
  }
}

async function handleLogin() {
  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    

    if (response.ok) {
      authToken = data.data.token
      id = data.data.foundUser.id

      const isAdmin = data.data.foundUser.role === "admin"
      localStorage.setItem("authToken", authToken)
      localStorage.setItem("id", id)
      localStorage.setItem("userData", data.data.foundUser)

      fetchUserData(isAdmin, id)
      showToast("Login successful!", "success")
      return isAdmin
    } else {
      showToast(data.message || "Login failed. Please check your credentials.", "error")
    }
  } catch (error) {
    console.error("Login error:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function handleRegister() {
  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const address = document.getElementById("register-address").value
  const isBusiness = document.querySelector('input[name="account-type"]:checked').value
  const businessName = document.getElementById("business-name").value || ""
  console.log({
    name,
    email,
    password,
    address,
    isBusiness,
    role: "user",
    businessName
  })

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        address,
        isBusiness,
        role: "user",
        businessName
      }),
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Registration successful! Please login.", "success")
      switchTab("login")
      document.getElementById("login-email").value = email
    } else {
      showToast(data.message || "Registration failed. Please try again.", "error")
    }
  } catch (error) {
    console.error("Registration error:", error)
    showToast("An error in filling data. Please try again later.", "error")
  }
}

async function fetchUserData(isAdmin, currentUserId) {
  console.log(isAdmin, currentUserId);
  
  if (!isAdmin) window.location.href = "userDashboard.html";
  try {
    const response = await fetch(`${API_BASE_URL}/user/${currentUserId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const user = await response.json()
      isAdmin = user.user.role === "admin"

      updateUIForUserRole(isAdmin)

      loginSection.classList.add("hidden")
      dashboardSection.classList.remove("hidden")

      userNameElement.textContent = user.user.name

      loadDashboardData(isAdmin)
      return isAdmin
    } else {
      handleLogout()
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    handleLogout()
  }
}

function updateUIForUserRole(boolean) {
  const adminOnlyElements = document.querySelectorAll(".admin-only")

  adminOnlyElements.forEach((element) => {
    if (boolean) {
      element.classList.remove("hidden")
    } else {
      element.classList.add("hidden")
    }
  })
}

function handleLogout() {
  authToken = null
  localStorage.removeItem("authToken")

  dashboardSection.classList.add("hidden")
  loginSection.classList.remove("hidden")

  loginForm.reset()
  registerForm.reset()

  switchTab("login")
}

// Load dashboard data
async function loadDashboardData(isAdmin) {
  try {
    const endpoint = isAdmin ? "/request" : "/request/my-requests"

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const requests = data.requests || []

      document.getElementById("request-count").textContent = requests.length

      const pendingCount = requests.filter((req) => req.status === "pending").length
      const progressCount = requests.filter((req) => req.status === "in-progress").length
      const completedCount = requests.filter((req) => req.status === "completed").length

      document.getElementById("pending-count").textContent = pendingCount
      document.getElementById("progress-count").textContent = progressCount
      document.getElementById("completed-count").textContent = completedCount

      updateRecentActivity(requests)
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error)
  }
}
function updateRecentActivity(requests) {
  const activityList = document.getElementById("recent-activity-list")

  if (!requests || requests.length === 0) {
    activityList.innerHTML = '<p class="empty-state">No recent activity</p>'
    return
  }

  const sortedRequests = [...requests].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const recentRequests = sortedRequests.slice(0, 5)

  let html = ""

  recentRequests.forEach((request) => {
    const date = new Date(request.createdAt)
    const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString()

    let statusClass = ""
    let statusIcon = ""

    switch (request.status) {
      case "pending":
        statusClass = "warning"
        statusIcon = "clock"
        break
      case "in-progress":
        statusClass = "primary"
        statusIcon = "spinner"
        break
      case "completed":
        statusClass = "success"
        statusIcon = "check-circle"
        break
    }

    html += `
            <div class="activity-item">
                <div class="activity-icon" style="color: var(--${statusClass}-color); background-color: rgba(var(--${statusClass}-color-rgb), 0.1);">
                    <i class="fas fa-${statusIcon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${request.deviceType} Support Request</div>
                    <div class="activity-subtitle">${request.problemDescription.substring(0, 50)}${request.problemDescription.length > 50 ? "..." : ""}</div>
                    <div class="activity-time">${formattedDate}</div>
                </div>
            </div>
        `
  })

  activityList.innerHTML = html
}
async function loadStatistics(isAdmin) {
  try {
    const endpoint = isAdmin ? "/request" : "/request/my-requests";

    // Fetch data
    const response1 = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const response2 = await fetch(`${API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response1.ok && response2.ok) {
      const data1 = await response1.json();
      const data2 = await response2.json();

      const requests = data1.requests || [];
      const users = data2.users || [];

      // Count device types
      const deviceTypes = {};
      requests.forEach((request) => {
        const type = request.deviceType;
        deviceTypes[type] = (deviceTypes[type] ?? 0) + 1;
      });

      const userTypes = {};
      users.forEach((user) => {
        if (user.role === "user") {
          const type = user.isBusiness? 'business': 'individual';
          userTypes[type] = (userTypes[type] ?? 0) + 1;
        }
      })
      

      const sortedDeviceTypes = Object.entries(deviceTypes).sort((a, b) => b[1] - a[1]);
      const sortedUserTypes = Object.entries(userTypes).sort((a, b) => b[1] - a[1]);

      // Prepare fallback labels and values
      const labels = [
        sortedDeviceTypes[0]?.[0] || 'Smartphone',
        sortedDeviceTypes[1]?.[0] || 'Motherboard',
        sortedDeviceTypes[2]?.[0] || 'Laptop',
        sortedDeviceTypes[3]?.[0] || 'Printer',
        sortedDeviceTypes[4]?.[0] || 'Server'
      ];

      const values = [
        sortedDeviceTypes[0]?.[1] || 60,
        sortedDeviceTypes[1]?.[1] || 15,
        sortedDeviceTypes[2]?.[1] || 15,
        sortedDeviceTypes[3]?.[1] || 5,
        sortedDeviceTypes[4]?.[1] || 5
      ];

      const colors = ['#2b6cb0', '#4299e1', '#63b3ed', '#63b3ed', '#bee3f8'];

      // Pie Chart
      new Chart(document.getElementById('subDisciplineChart'), {
        type: 'pie',
        data: {
          labels: [
            sortedUserTypes[0]?.[0] || "Individual",
            sortedUserTypes[1]?.[0] || "Business"
          ],
          datasets: [{
            data: [
              sortedUserTypes[0]?.[1] || 2,
              sortedUserTypes[1]?.[1] || 2
            ],
            backgroundColor: ['#63b3ed', '#2b6cb0']
          }]
        },
        options: {
          responsive: true,
          animation: { duration: 1000 },
          plugins: {
            tooltip: { enabled: true },
            legend: { position: 'bottom' }
          }
        },
        plugins: {
          tooltip: { enabled: true },
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'User Type Distribution'
          }
        }
      });

      // Bar Chart
      new Chart(document.getElementById('industryImpactChart'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors
          }]
        },
        options: {
          responsive: true,
          animation: { duration: 1000 },
          scales: { y: { beginAtZero: true } },
          plugins: { tooltip: { enabled: true } }
        }
      });
    }
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

async function loadSupportRequests(isAdmin) {
  const requestList = document.getElementById("request-list")
  requestList.innerHTML = '<div class="loading">Loading requests...</div>'

  try {
    const endpoint = isAdmin ? "/request" : "/request/my-requests"

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const requests = data.requests || []
      console.log(requests)

      if (requests.length === 0) {
        requestList.innerHTML = '<p class="empty-state">No support requests found</p>'
        return
      }

      let html = ""

      requests.forEach((request) => {
        const date = new Date(request.scheduledDate)
        const formattedDate = date.toLocaleString()

        let statusClass = ""
        switch (request.status) {
          case "pending":
            statusClass = "status-pending"
            break
          case "in-progress":
            statusClass = "status-progress"
            break
          case "completed":
            statusClass = "status-completed"
            break
        }
        html += `
                    <div class="list-item" data-id="${request.id}">
                        <div class="list-item-details">
                            <div class="list-item-title">${request.deviceType} Support</div>
                            <div class="list-item-subtitle">Scheduled: ${formattedDate}</div>
                        </div>
                        <div class="status-badge ${statusClass}">${request.status}</div>
                        <div class="list-item-actions">
                            <button class="btn btn-small view-request" data-id="${request.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${
                              isAdmin
                                ? `
                                <button class="btn btn-small btn-warning edit-request" data-id="${request.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-small btn-danger delete-request" data-id="${request.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            `
                                : ""
                            }
                        </div>
                    </div>
                `
      })

      requestList.innerHTML = html

      document.querySelectorAll(".view-request").forEach((btn) => {
        btn.addEventListener("click", () => {
          const requestId = btn.getAttribute("data-id")
          viewRequestDetails(requestId)
          console.log(requestId)
        })
      })

      if (isAdmin) {
        document.querySelectorAll(".edit-request").forEach((btn) => {
          btn.addEventListener("click", () => {
            const requestId = btn.getAttribute("data-id")
            editRequest(requestId, isAdmin)
          })
        })

        document.querySelectorAll(".delete-request").forEach((btn) => {
          btn.addEventListener("click", () => {
            const requestId = btn.getAttribute("data-id")
            deleteRequest(requestId, isAdmin)
          })
        })
      }
    } else {
      requestList.innerHTML = '<p class="empty-state">Failed to load support requests</p>'
    }
  } catch (error) {
    console.error("Error loading support requests:", error)
    requestList.innerHTML = '<p class="empty-state">An error occurred while loading requests</p>'
  }
}

async function createSupportRequest() {
  const deviceType = document.getElementById("device-type").value
  const problemDescription = document.getElementById("problem-description").value
  const scheduledDate = document.getElementById("scheduled-date").value
  const isAdmin = false

  try {
    const response = await fetch(`${API_BASE_URL}/request/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        deviceType,
        problemDescription,
        scheduledDate,
        status: "pending",
      }),
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Support request created successfully!", "success")
      closeAllModals()
      document.getElementById("request-form").reset()
      loadSupportRequests(isAdmin)
      loadDashboardData(isAdmin)
    } else {
      showToast(data.message || "Failed to create support request", "error")
    }
  } catch (error) {
    console.error("Error creating support request:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function viewRequestDetails(requestId) {
  try {
    const response = await fetch(`${API_BASE_URL}/request/${requestId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const request = data.request

      const detailsContent = document.getElementById("request-details-content")
      const scheduledDate = new Date(request.scheduledDate).toLocaleString()
      const createdDate = new Date(request.createdAt).toLocaleString()

      let statusClass = ""
      switch (request.status) {
        case "pending":
          statusClass = "status-pending"
          break
        case "in-progress":
          statusClass = "status-progress"
          break
        case "completed":
          statusClass = "status-completed"
          break
      }

      detailsContent.innerHTML = `
                <div class="request-details">
                    <div class="detail-group">
                        <label>Device Type:</label>
                        <p>${request.deviceType}</p>
                    </div>
                    <div class="detail-group">
                        <label>Problem Description:</label>
                        <p>${request.problemDescription}</p>
                    </div>
                    <div class="detail-group">
                        <label>Scheduled Date:</label>
                        <p>${scheduledDate}</p>
                    </div>
                    <div class="detail-group">
                        <label>Status:</label>
                        <p><span class="status-badge ${statusClass}">${request.status}</span></p>
                    </div>
                    <div class="detail-group">
                        <label>Created On:</label>
                        <p>${createdDate}</p>
                    </div>
                    ${
                      request.quote
                        ? `
                        <div class="detail-group">
                            <label>Quote:</label>
                            <p>${request.quote}</p>
                        </div>
                    `
                        : ""
                    }
                </div>
            `

      openModal("request-details-modal")
    } else {
      showToast("Failed to load request details", "error")
    }
  } catch (error) {
    console.error("Error viewing request details:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function loadKnowledgeBase(isAdmin) {
  const kbList = document.getElementById("kb-list")
  kbList.innerHTML = '<div class="loading">Loading knowledge base articles...</div>'

  try {
    const response = await fetch(`${API_BASE_URL}/knowledge`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const articles = data.knowledgeBases || []

      if (articles.length === 0) {
        kbList.innerHTML = '<p class="empty-state">No knowledge base articles found</p>'
        return
      }

      let html = ""

      articles.forEach((article) => {
        html += `
                    <div class="list-item kb-item" data-id="${article.id}" data-category="${article.category}">
                        <div class="list-item-details">
                            <div class="list-item-title">${article.title}</div>
                            <div class="list-item-subtitle">Category: ${article.category}</div>
                        </div>
                        <div class="list-item-actions">
                            <button class="btn btn-small view-kb" data-id="${article.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${
                              isAdmin
                                ? `
                                <button class="btn btn-small btn-warning edit-kb" data-id="${article.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-small btn-danger delete-kb" data-id="${article.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            `
                                : ""
                            }
                        </div>
                    </div>
                `
      })

      kbList.innerHTML = html

      document.querySelectorAll(".view-kb").forEach((btn) => {
        btn.addEventListener("click", () => {
          const articleId = btn.getAttribute("data-id")
          viewKnowledgeBaseArticle(articleId)
        })
      })

      if (isAdmin) {
        document.querySelectorAll(".edit-kb").forEach((btn) => {
          btn.addEventListener("click", () => {
            const articleId = btn.getAttribute("data-id")
            editKnowledgeBaseArticle(articleId)
          })
        })

        document.querySelectorAll(".delete-kb").forEach((btn) => {
          btn.addEventListener("click", () => {
            const articleId = btn.getAttribute("data-id")
            deleteKnowledgeBaseArticle(articleId)
          })
        })
      }
    } else {
      kbList.innerHTML = '<p class="empty-state">Failed to load knowledge base articles</p>'
    }
  } catch (error) {
    console.error("Error loading knowledge base:", error)
    kbList.innerHTML = '<p class="empty-state">An error occurred while loading articles</p>'
  }
}

function filterKnowledgeBase(filter) {
  document.querySelectorAll(".kb-filter").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`.kb-filter[data-filter="${filter}"]`).classList.add("active")

  const articles = document.querySelectorAll(".kb-item")

  articles.forEach((article) => {
    if (filter === "all" || article.getAttribute("data-category") === filter) {
      article.style.display = "flex"
    } else {
      article.style.display = "none"
    }
  })
}

async function viewKnowledgeBaseArticle(articleId) {
  try {
    const response = await fetch(`${API_BASE_URL}/knowledge/${articleId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const article = data.knowledgeBase
      const modalTitle = document.getElementById("kb-modal-title")
      const modalContent = document.getElementById("kb-modal-content")

      modalTitle.textContent = article.title

      let symptomsHtml = ""
      if (typeof article.symptoms === "object") {
        const symptoms = Object.values(article.symptoms)
        symptomsHtml = symptoms.map((symptom) => `<li>${symptom}</li>`).join("")
      }

      let solutionHtml = ""
      if (typeof article.solutionSteps === "object") {
        const steps = Object.values(article.solutionSteps)
        solutionHtml = steps.map((step, index) => `<li><strong>Step ${index + 1}:</strong> ${step}</li>`).join("")
      }

      modalContent.innerHTML = `
                <div class="kb-article">
                    <div class="kb-section">
                        <h4>Category</h4>
                        <p>${article.category}</p>
                    </div>
                    <div class="kb-section">
                        <h4>Symptoms</h4>
                        <ul>${symptomsHtml}</ul>
                    </div>
                    <div class="kb-section">
                        <h4>Solution Steps</h4>
                        <ol>${solutionHtml}</ol>
                    </div>
                </div>
            `

      openModal("kb-modal")
    } else {
      showToast("Failed to load article details", "error")
    }
  } catch (error) {
    console.error("Error viewing article:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function createKnowledgeBase(isAdmin) {
  const title = document.getElementById("kb-title").value
  const category = document.getElementById("kb-category").value
  const symptomsText = document.getElementById("kb-symptoms").value
  const solutionText = document.getElementById("kb-solution").value

  const symptomsArray = symptomsText.split("\n").filter((line) => line.trim() !== "")
  const solutionArray = solutionText.split("\n").filter((line) => line.trim() !== "")

  const symptoms = {}
  symptomsArray.forEach((symptom, index) => {
    symptoms[index] = symptom
  })

  const solutionSteps = {}
  solutionArray.forEach((step, index) => {
    solutionSteps[index] = step
  })

  try {
    const response = await fetch(`${API_BASE_URL}/knowledge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title,
        category,
        symptoms,
        solutionSteps,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Knowledge base article created successfully!", "success")
      closeAllModals()
      document.getElementById("kb-form").reset()
      loadKnowledgeBase(isAdmin)
    } else {
      showToast(data.message || "Failed to create article", "error")
    }
  } catch (error) {
    console.error("Error creating article:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function loadSpareParts(isAdmin) {
  const partsList = document.getElementById("parts-list")
  partsList.innerHTML = '<div class="loading">Loading spare parts inventory...</div>'

  try {
    const response = await fetch(`${API_BASE_URL}/parts`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const parts = data.parts || []

      if (parts.length === 0) {
        partsList.innerHTML = '<p class="empty-state">No spare parts found</p>'
        return
      }

      let html = '<div class="part-grid">'

      parts.forEach((part) => {
        let stockLevel = "low"
        let stockClass = "stock-low"
        if (part.stock > 20) {
          stockLevel = "high"
          stockClass = "stock-high"
        } else if (part.stock > 5) {
          stockLevel = "medium"
          stockClass = "stock-medium"
        }

        let category = part.partName
        if (category === "SSD" || category === "HDD") {
          category = "Storage"
        }

        html += `
          <div class="part-card" data-id="${part.id}" data-name="${part.partName}" data-category="${category}">
            <div class="part-header">
              <div class="part-name">${part.partName}</div>
              <div class="part-stock">
                <span class="stock-indicator ${stockClass}"></span>
                <span>${part.stock} in stock (${stockLevel})</span>
              </div>
            </div>
            <div class="part-details">
              <div class="part-price">$${part.price.toFixed(2)}</div>
              <div class="part-description">${part.description || "No description available"}</div>
            </div>
            <div class="part-actions">
              <button class="btn btn-small view-part" data-id="${part.id}">
                <i class="fas fa-eye"></i> View
              </button>
              ${
                isAdmin
                  ? `
                  <button class="btn btn-small btn-warning edit-part" data-id="${part.id}">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="btn btn-small btn-danger delete-part" data-id="${part.id}">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                  `
                  : ""
              }
            </div>
          </div>
        `
      })

      html += "</div>"
      partsList.innerHTML = html

      document.querySelectorAll(".view-part").forEach((btn) => {
        btn.addEventListener("click", () => {
          const partId = btn.getAttribute("data-id")
          viewPartDetails(partId)
        })
      })

      if (isAdmin) {
        document.querySelectorAll(".edit-part").forEach((btn) => {
          btn.addEventListener("click", () => {
            const partId = btn.getAttribute("data-id")
            editPart(partId, isAdmin)
          })
        })

        document.querySelectorAll(".delete-part").forEach((btn) => {
          btn.addEventListener("click", () => {
            const partId = btn.getAttribute("data-id")
            deletePart(partId, isAdmin)
          })
        })
      }

      setupPartSearchAndFilters()
    } else {
      partsList.innerHTML = '<p class="empty-state">Failed to load spare parts</p>'
    }
  } catch (error) {
    console.error("Error loading spare parts:", error)
    partsList.innerHTML = '<p class="empty-state">An error occurred while loading parts</p>'
  }
}

function setupPartSearchAndFilters() {
  const searchInput = document.getElementById("parts-search")
  const searchBtn = document.getElementById("parts-search-btn")

  if (searchInput && searchBtn) {
    searchBtn.addEventListener("click", () => {
      searchParts(searchInput.value)
    })

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchParts(searchInput.value)
      }
    })
  }

  document.querySelectorAll(".part-filter").forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.getAttribute("data-filter")
      filterParts(filterValue)
    })
  })
}

function searchParts(query) {
  query = query.toLowerCase().trim()
  const parts = document.querySelectorAll(".part-card")

  if (!query) {
    parts.forEach((part) => {
      part.style.display = "block"
    })
    return
  }

  parts.forEach((part) => {
    const name = part.querySelector(".part-name").textContent.toLowerCase()
    const description = part.querySelector(".part-description").textContent.toLowerCase()

    if (name.includes(query) || description.includes(query)) {
      part.style.display = "block"
    } else {
      part.style.display = "none"
    }
  })
}

function filterParts(filter) {
  document.querySelectorAll(".part-filter").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`.part-filter[data-filter="${filter}"]`).classList.add("active")

  const parts = document.querySelectorAll(".part-card")

  parts.forEach((part) => {
    if (filter === "all") {
      part.style.display = "block"
    } else {
      const category = part.getAttribute("data-category")
      if (category === filter) {
        part.style.display = "block"
      } else {
        part.style.display = "none"
      }
    }
  })
}

async function createSparePart(isAdmin) {
  const partName = document.getElementById("part-name").value
  const stock = document.getElementById("part-stock").value
  const price = document.getElementById("part-price").value
  const description = document.getElementById("part-description").value

  try {
    const response = await fetch(`${API_BASE_URL}/parts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        partName,
        stock: Number.parseInt(stock),
        price: Number.parseFloat(price),
        description,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Spare part added successfully!", "success")
      closeAllModals()
      document.getElementById("part-form").reset()
      loadSpareParts(isAdmin)
    } else {
      showToast(data.message || "Failed to add spare part", "error")
    }
  } catch (error) {
    console.error("Error adding spare part:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function viewPartDetails(partId) {
  try {
    const response = await fetch(`${API_BASE_URL}/parts/${partId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const part = data.part

      const partDetailsModal = document.getElementById("part-details-modal")
      if (!partDetailsModal) {
        const modalHtml = `
            <div class="modal" id="part-details-modal">
              <div class="modal-content">
                <div class="modal-header">
                  <h3>Part Details</h3>
                  <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                  <div id="part-details-content"></div>
                </div>
              </div>
            </div>
          `
        document.body.insertAdjacentHTML("beforeend", modalHtml)

        document.querySelector("#part-details-modal .close-modal").addEventListener("click", () => {
          closeAllModals()
        })
      }

      const formattedPrice = part.price.toFixed(2)
      const createdDate = part.createdAt ? new Date(part.createdAt).toLocaleString() : "N/A"

      const partDetailsContent = document.getElementById("part-details-content")
      partDetailsContent.innerHTML = `
          <div class="part-details">
            <div class="detail-group">
              <label>Part Name:</label>
              <p>${part.partName}</p>
            </div>
            <div class="detail-group">
              <label>Stock Quantity:</label>
              <p>${part.stock}</p>
            </div>
            <div class="detail-group">
              <label>Price:</label>
              <p>$${formattedPrice}</p>
            </div>
            <div class="detail-group">
              <label>Description:</label>
              <p>${part.description || "No description available"}</p>
            </div>
            <div class="detail-group">
              <label>Added On:</label>
              <p>${createdDate}</p>
            </div>
          </div>
        `

      openModal("part-details-modal")
    } else {
      showToast("Failed to load part details", "error")
    }
  } catch (error) {
    console.error("Error viewing part details:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function editPart(partId, isAdmin) {
  try {
    let editModal = document.getElementById("edit-part-modal")
    // document.querySelector("#edit-part-modal .close-modal").addEventListener("click", () => {
    //   closeAllModals()
    // })

    if (!editModal) {
      const modalHtml = `
          <div class="modal" id="edit-part-modal">
            <div class="modal-content">
              <div class="modal-header">
                <h3>Edit Spare Part</h3>
                <span class="close-modal">&times;</span>
              </div>
              <div class="modal-body">
                <form id="edit-part-form">
                  <input type="hidden" id="edit-part-id">
                  <input type="hidden" id="edit-part-admin">
                  <div class="form-group">
                    <label for="edit-part-name">Part Name</label>
                    <select id="edit-part-name" required>
                      <option value="">Select Part Type</option>
                      <option value="Motherboard">Motherboard</option>
                      <option value="RAM">RAM</option>
                      <option value="SSD">SSD</option>
                      <option value="HDD">HDD</option>
                      <option value="CPU">CPU</option>
                      <option value="GPU">GPU</option>
                      <option value="Laptop Battery">Laptop Battery</option>
                      <option value="Charger">Charger</option>
                      <option value="Cooling Fan">Cooling Fan</option>
                      <option value="Screen">Screen</option>
                      <option value="Keyboard">Keyboard</keyboard>
                      <option value="Touchpad">Touchpad</touchpad>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="edit-part-stock">Stock Quantity</label>
                    <input type="number" id="edit-part-stock" min="0" required>
                  </div>
                  <div class="form-group">
                    <label for="edit-part-price">Price</label>
                    <input type="number" id="edit-part-price" min="0" step="0.01" required>
                  </div>
                  <div class="form-group">
                    <label for="edit-part-description">Description</label>
                    <textarea id="edit-part-description" rows="3" required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">Update Part</button>
                </form>
              </div>
            </div>
          </div>
        `
      

      document.body.insertAdjacentHTML("beforeend", modalHtml)

      document.getElementById("edit-part-form").addEventListener("submit", (e) => {
        e.preventDefault()
        saveEditedPart(isAdmin)
      })

      // Add event listener to close button
      document.querySelector("#edit-part-modal .close-modal").addEventListener("click", () => {
        closeAllModals()
      })

      document.getElementById("edit-part-form").addEventListener("submit", (e) => {
        e.preventDefault()
        saveEditedPart(isAdmin)
      })

      editModal = document.getElementById("edit-part-modal")
    }

    const response = await fetch(`${API_BASE_URL}/parts/${partId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const part = data.part

      document.getElementById("edit-part-id").value = partId
      document.getElementById("edit-part-name").value = part.partName
      document.getElementById("edit-part-stock").value = part.stock
      document.getElementById("edit-part-price").value = part.price
      document.getElementById("edit-part-description").value = part.description || ""

      editModal.style.display = "block"
    } else {
      showToast("Failed to load part details", "error")
    }
  } catch (error) {
    console.error("Error editing part:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

function saveEditedPart(isAdmin) {
  const partId = document.getElementById("edit-part-id").value
  const partName = document.getElementById("edit-part-name").value
  const stock = document.getElementById("edit-part-stock").value
  const price = document.getElementById("edit-part-price").value
  const description = document.getElementById("edit-part-description").value

  const currentToken = authToken

  const requestBody = {
    partName: partName,
    stock: Number.parseInt(stock),
    price: Number.parseFloat(price),
    description: description,
  }

  fetch(`${API_BASE_URL}/parts/${partId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      showToast("Spare part updated successfully!", "success")
      closeAllModals()

      setTimeout(() => {
        loadSpareParts(isAdmin)
      }, 100)
    })
    .catch((error) => {
      console.error("Error updating part:", error)
      showToast("Failed to update part: " + error.message, "error")
    })
}

async function deletePart(partId, isAdmin) {
  if (confirm("Are you sure you want to delete this spare part?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/parts/${partId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        showToast("Spare part deleted successfully!", "success")
        loadSpareParts(isAdmin)
      } else {
        const data = await response.json()
        showToast(data.message || "Failed to delete spare part", "error")
      }
    } catch (error) {
      console.error("Error deleting spare part:", error)
      showToast("An error occurred. Please try again later.", "error")
    }
  }
}

async function loadJobs(isAdmin) {
  const jobList = document.getElementById("job-list")
  jobList.innerHTML = '<div class="loading">Loading scheduled jobs...</div>'

  try {
    const response = await fetch(`${API_BASE_URL}/job`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const jobs = data.jobs || []

      if (jobs.length === 0) {
        jobList.innerHTML = '<p class="empty-state">No scheduled jobs found</p>'
        return
      }

      let html = ""

      jobs.forEach((job) => {
        const scheduledDate = new Date(job.scheduledDate).toLocaleDateString()
        const completionDate = new Date(job.completedAt).toLocaleDateString()

        let priorityClass = ""
        switch (job.priority) {
          case "low":
            priorityClass = "status-pending"
            break
          case "medium":
            priorityClass = "status-progress"
            break
          case "high":
            priorityClass = "status-completed"
            break
        }

        html += `
        <div class="list-item" data-id="${job.id}">
            <div class="list-item-details">
            <div class="list-item-title">Technician: ${job.technician}</div>
            <div class="list-item-subtitle">Scheduled: ${scheduledDate} | Completion: ${completionDate}</div>
            </div>
            <div class="status-badge ${priorityClass}">${job.priority}</div>
            <div class="list-item-actions">
            <button class="btn btn-small view-job" data-id="${job.id}">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-small btn-warning edit-job" data-id="${job.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-small btn-danger delete-job" data-id="${job.id}">
                <i class="fas fa-trash"></i>
            </button>
            </div>
        </div>
        `
      })

      jobList.innerHTML = html

      document.querySelectorAll(".view-job").forEach((btn) => {
        btn.addEventListener("click", () => {
          const jobId = btn.getAttribute("data-id")
          viewJobDetails(jobId)
        })
      })

      document.querySelectorAll(".edit-job").forEach((btn) => {
        btn.addEventListener("click", () => {
          const jobId = btn.getAttribute("data-id")
          editJob(jobId)
        })
      })

      document.querySelectorAll(".create-job").forEach((btn) => {
        btn.addEventListener("click", () => {
          const jobId = btn.getAttribute("data-id")
          createJob(jobId, isAdmin)
        })
      })

      document.querySelectorAll(".delete-job").forEach((btn) => {
        btn.addEventListener("click", () => {
          const jobId = btn.getAttribute("data-id")
          deleteJob(jobId, isAdmin)
        })
      })
    } else {
      jobList.innerHTML = '<p class="empty-state">Failed to load scheduled jobs</p>'
    }
  } catch (error) {
    console.error("Error loading jobs:", error)
    jobList.innerHTML = '<p class="empty-state">An error occurred while loading jobs</p>'
  }
}

async function viewJobDetails(jobId) {
  try {
    const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const job = data.job

      const jobDetailsModal = document.getElementById("job-details-modal")
      if (!jobDetailsModal) {
        const modalHtml = `
            <div class="modal" id="job-details-modal">
              <div class="modal-content">
                <div class="modal-header">
                  <h3>Job Details</h3>
                  <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                  <div id="job-details-content"></div>
                </div>
              </div>
            </div>
          `
        document.body.insertAdjacentHTML("beforeend", modalHtml)

        document.querySelector("#job-details-modal .close-modal").addEventListener("click", () => {
          closeAllModals()
        })

        document.querySelector("#job-details-modal .close-btn").addEventListener("click", () => {
          closeAllModals()
        })
      }

      const scheduledDate = new Date(job.scheduledDate).toLocaleString()
      const completionDate = job.completedAt ? new Date(job.completedAt).toLocaleString() : "Not completed"
      const createdDate = job.createdAt ? new Date(job.createdAt).toLocaleString() : "N/A"
      const updatedDate = job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "N/A"

      let priorityClass = ""
      switch (job.priority) {
        case "low":
          priorityClass = "status-pending"
          break
        case "medium":
          priorityClass = "status-progress"
          break
        case "high":
          priorityClass = "status-completed"
          break
      }

      const jobDetailsContent = document.getElementById("job-details-content")
      jobDetailsContent.innerHTML = `
          <div class="job-details">
            <div class="detail-group">
              <label>Support Request ID:</label>
              <p>${job.supportRequestId}</p>
            </div>
            <div class="detail-group">
              <label>Technician:</label>
              <p>${job.technician}</p>
            </div>
            <div class="detail-group">
              <label>Priority:</label>
              <p><span class="status-badge ${priorityClass}">${job.priority}</span></p>
            </div>
            <div class="detail-group">
              <label>Scheduled Date:</label>
              <p>${scheduledDate}</p>
            </div>
            <div class="detail-group">
              <label>Completion Date:</label>
              <p>${completionDate}</p>
            </div>
            <div class="detail-group">
              <label>Created On:</label>
              <p>${createdDate}</p>
            </div>
            <div class="detail-group">
              <label>Last Updated:</label>
              <p>${updatedDate}</p>
            </div>
          </div>
        `

      openModal("job-details-modal")
    } else {
      showToast("Failed to load job details", "error")
    }
  } catch (error) {
    console.error("Error viewing job details:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function editJob(jobId) {
  try {
    openModal("job-modal")
    await populateJobFormSelects()

    const modalHeader = document.querySelector("#job-modal .modal-header h3")
    modalHeader.textContent = "Edit Scheduled Job"

    const jobForm = document.getElementById("job-form")
    let jobIdInput = document.getElementById("edit-job-id")
    if (!jobIdInput) {
      jobIdInput = document.createElement("input")
      jobIdInput.type = "hidden"
      jobIdInput.id = "edit-job-id"
      jobForm.appendChild(jobIdInput)
    }
    jobIdInput.value = jobId

    const submitBtn = jobForm.querySelector("button[type='submit']")
    submitBtn.textContent = "Update Job"

    const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const job = data.job

      document.getElementById("job-request").value = job.supportRequestId
      document.getElementById("job-technician").value = job.technician
      document.getElementById("job-priority").value = job.priority

      if (job.scheduledDate) {
        const scheduledDate = new Date(job.scheduledDate)
        const formattedScheduledDate = scheduledDate.toISOString().split("T")[0]
        document.getElementById("job-date").value = formattedScheduledDate
      }

      if (job.completedAt) {
        const completionDate = new Date(job.completedAt)
        const formattedCompletionDate = completionDate.toISOString().split("T")[0]
        document.getElementById("job-completion").value = formattedCompletionDate
      }

      jobForm.dataset.mode = "edit"
      jobForm.dataset.jobId = jobId

      jobForm.onsubmit = function (e) {
        e.preventDefault()
        if (this.dataset.mode === "edit") {
          updateJob(this.dataset.jobId)
        } else {
          createJob(isAdmin)
        }
      }
    } else {
      showToast("Failed to load job details", "error")
      closeAllModals()
    }
  } catch (error) {
    console.error("Error editing job:", error)
    showToast("An error occurred. Please try again later.", "error")
    closeAllModals()
  }
}

async function updateJob(jobId) {
  try {
    const supportRequestId = document.getElementById("job-request").value
    const technician = document.getElementById("job-technician").value
    const priority = document.getElementById("job-priority").value
    const scheduledDate = document.getElementById("job-date").value
    const completedAt = document.getElementById("job-completion").value
    const isAdmin = false

    if (!supportRequestId || !technician || !priority || !scheduledDate || !completedAt) {
      showToast("Please fill in all required fields", "error")
      return
    }

    const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        supportRequestId,
        technician,
        priority,
        scheduledDate,
        completedAt,
      }),
    })

    if (response.ok) {
      await deleteJob(jobId)
      showToast("Job updated successfully!", "success")
      closeAllModals()
      document.getElementById("job-form").reset()
      loadJobs()
    } else {
      const data = await response.json()
      showToast(data.message || "Failed to update job", "error")
    }
  } catch (error) {
    console.error("Error updating job:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function createJob(isAdmin) {
  try {
    const supportRequestId = document.getElementById("job-request").value
    const technician = document.getElementById("job-technician").value
    const priority = document.getElementById("job-priority").value
    const scheduledDate = document.getElementById("job-date").value
    const completedAt = document.getElementById("job-completion").value

    if (!supportRequestId || !technician || !priority || !scheduledDate || !completedAt) {
      showToast("Please fill in all required fields", "error")
      return
    }

    const response = await fetch(`${API_BASE_URL}/job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        supportRequestId,
        technician,
        priority,
        scheduledDate,
        completedAt,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Job scheduled successfully!", "success")
      closeAllModals()
      document.getElementById("job-form").reset()
      loadJobs(isAdmin)
    } else {
      showToast(data.message || "Failed to schedule job", "error")
    }
  } catch (error) {
    console.error("Error scheduling job:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}
async function deleteJob(jobId, isAdmin) {
  try {
    const response = await fetch(`${API_BASE_URL}/job/${jobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      showToast("Job deleted successfully!", "success")
      loadJobs(isAdmin)
    } else {
      const data = await response.json()
      showToast(data.message || "Failed to delete job", "error")
    }
  } catch (error) {
    console.error("Error deleting job:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function loadTechnicians(isAdmin) {
  const techList = document.getElementById("tech-list")
  techList.innerHTML = '<div class="loading">Loading technicians...</div>'

  try {
    const response = await fetch(`${API_BASE_URL}/tech`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const technicians = data.technicians || []

      if (technicians.length === 0) {
        techList.innerHTML = '<p class="empty-state">No technicians found</p>'
        return
      }

      let html = ""

      technicians.forEach((tech) => {
        html += `
        <div class="list-item" data-id="${tech.id}">
            <div class="list-item-details">
            <div class="list-item-title">${tech.name}</div>
            <div class="list-item-subtitle">Technician ID: ${tech.id}</div>
            </div>
            <div class="list-item-actions">
            <button class="btn btn-small btn-danger delete-tech" data-id="${tech.id}">
                <i class="fas fa-trash"></i>
            </button>
            </div>
        </div>
        `
      })

      techList.innerHTML = html
      document.querySelectorAll(".delete-tech").forEach((btn) => {
        btn.addEventListener("click", () => {
          const techId = btn.getAttribute("data-id")
          deleteTechnician(techId, isAdmin)
        })
      })
    } else {
      techList.innerHTML = '<p class="empty-state">Failed to load technicians</p>'
    }
  } catch (error) {
    console.error("Error loading technicians:", error)
    techList.innerHTML = '<p class="empty-state">An error occurred while loading technicians</p>'
  }
}

async function createTechnician(isAdmin) {
  const name = document.getElementById("tech-name").value

  try {
    const response = await fetch(`${API_BASE_URL}/tech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Technician added successfully!", "success")
      closeAllModals()
      document.getElementById("tech-form").reset()
      loadTechnicians(isAdmin)
    } else {
      showToast(data.message || "Failed to add technician", "error")
    }
  } catch (error) {
    console.error("Error adding technician:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function deleteTechnician(techId, isAdmin) {
  if (confirm("Are you sure you want to delete this technician?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/tech/${techId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        showToast("Technician deleted successfully!", "success")
        loadTechnicians(isAdmin)
      } else {
        showToast("Failed to delete technician", "error")
      }
    } catch (error) {
      console.error("Error deleting technician:", error)
      showToast("An error occurred. Please try again later.", "error")
    }
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"

    const modalHeader = document.querySelector("#job-modal .modal-header h3")
    modalHeader.textContent = "Create Scheduled Job"

    const jobForm = document.getElementById("job-form")
    const submitBtn = jobForm.querySelector("button[type='submit']")
    submitBtn.textContent = "Create Job"
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none"
  })
}

async function populateJobFormSelects() {
  let requestSelect
  try {
    requestSelect = document.getElementById("job-request")
    requestSelect.innerHTML = '<option value="">Loading...</option>'

    const requestResponse = await fetch(`${API_BASE_URL}/request`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (requestResponse.ok) {
      const requestData = await requestResponse.json()
      const requests = requestData.requests || []

      requestSelect.innerHTML = '<option value="">Select a Request</option>'
      requests.forEach((request) => {
        const option = document.createElement("option")
        option.value = request.id
        option.textContent = `${request.deviceType} - ${request.problemDescription.substring(0, 20)}...`
        requestSelect.appendChild(option)
      })
    } else {
      requestSelect.innerHTML = '<option value="">Failed to load requests</option>'
    }
  } catch (error) {
    console.error("Error loading support requests:", error)
    requestSelect.innerHTML = '<option value="">An error occurred</option>'
  }

  let technicianSelect
  try {
    technicianSelect = document.getElementById("job-technician")
    technicianSelect.innerHTML = '<option value="">Loading...</option>'

    const technicianResponse = await fetch(`${API_BASE_URL}/tech`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (technicianResponse.ok) {
      const technicianData = await technicianResponse.json()
      const technicians = technicianData.technicians || []

      technicianSelect.innerHTML = '<option value="">Select a Technician</option>'
      technicians.forEach((technician) => {
        const option = document.createElement("option")
        option.value = technician.name
        option.textContent = technician.name
        technicianSelect.appendChild(option)
      })
    } else {
      technicianSelect.innerHTML = '<option value="">Failed to load technicians</option>'
    }
  } catch (error) {
    console.error("Error loading technicians:", error)
    technicianSelect.innerHTML = '<option value="">An error occurred</option>'
  }
}

async function viewTechnicianDetails(techId) {
  showToast(`View technician details for ID: ${techId}`, "info")
}

async function editTechnician(techId) {
  showToast(`Edit technician with ID: ${techId}`, "info")
}

async function editRequest(requestId, isAdmin) {
  try {
    let editModal = document.getElementById("edit-request-modal")

    if (!editModal) {
      const modalHtml = `
        <div class="modal" id="edit-request-modal">
        <div class="modal-content">
            <div class="modal-header">
            <h3>Edit Support Request</h3>
            <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
            <form id="edit-request-form">
                <input type="hidden" id="edit-request-id">
                <div class="form-group">
                <label for="edit-device-type">Device Type</label>
                <select id="edit-device-type" required>
                    <option value="">Select Device Type</option>
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="printer">Printer</option>
                    <option value="tablet">Tablet</option>
                    <option value="smartphone">Smartphone</option>
                    <option value="server">Server</option>
                    <option value="monitor">Monitor</option>
                    <option value="router">Router</option>
                    <option value="scanner">Scanner</option>
                    <option value="external drive">External Drive</option>
                    <option value="keyboard">Keyboard</keyboard>
                    <option value="mouse">Mouse</mouse>
                    <option value="projector">Projector</projector>
                    <option value="network switch">Network Switch</network switch</option>
                    <option value="other">Other</option>
                </select>
                </div>
                <div class="form-group">
                <label for="edit-problem-description">Problem Description</label>
                <textarea id="edit-problem-description" rows="4" required></textarea>
                </div>
                <div class="form-group">
                <label for="edit-scheduled-date">Scheduled Date</label>
                <input type="date" id="edit-scheduled-date" required>
                </div>
                <div class="form-group admin-only">
                <label for="edit-status">Status</label>
                <select id="edit-status" required>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
                </div>
                <div class="form-group admin-only">
                <label for="edit-quote">Quote</label>
                <input type="text" id="edit-quote">
                </div>
                <button type="submit" class="btn btn-primary">Update Request</button>
            </form>
            </div>
        </div>
        </div>
    `

      document.body.insertAdjacentHTML("beforeend", modalHtml)

      document.querySelector("#edit-request-modal .close-modal").addEventListener("click", () => {
        closeAllModals()
      })

      document.getElementById("edit-request-form").addEventListener("submit", (e) => {
        e.preventDefault()
        saveEditedRequest(isAdmin)
      })

      editModal = document.getElementById("edit-request-modal")
    }

    const response = await fetch(`${API_BASE_URL}/request/${requestId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const request = data.request

      document.getElementById("edit-request-id").value = requestId
      document.getElementById("edit-device-type").value = request.deviceType
      document.getElementById("edit-problem-description").value = request.problemDescription

      const scheduledDate = new Date(request.scheduledDate)
      const formattedDate = scheduledDate.toISOString().split("T")[0]
      document.getElementById("edit-scheduled-date").value = formattedDate

      document.getElementById("edit-status").value = request.status

      if (document.getElementById("edit-quote")) {
        document.getElementById("edit-quote").value = request.quote || ""
      }

      editModal.style.display = "block"
    } else {
      showToast("Failed to load request details", "error")
    }
  } catch (error) {
    console.error("Error editing request:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function saveEditedRequest(isAdmin) {
  const requestId = document.getElementById("edit-request-id").value
  const deviceType = document.getElementById("edit-device-type").value
  const problemDescription = document.getElementById("edit-problem-description").value
  const scheduledDate = document.getElementById("edit-scheduled-date").value
  const status = document.getElementById("edit-status").value
  const quote = document.getElementById("edit-quote") ? document.getElementById("edit-quote").value : ""

  try {
    const requestBody = {
      deviceType,
      problemDescription,
      scheduledDate,
      status,
    }

    if (quote) {
      requestBody.quote = quote
    }

    const response = await fetch(`${API_BASE_URL}/request/${requestId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Support request updated successfully!", "success")
      closeAllModals()
      loadSupportRequests(isAdmin)
      loadDashboardData(isAdmin)
    } else {
      showToast(data.message || "Failed to update support request", "error")
    }
  } catch (error) {
    console.error("Error updating support request:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function deleteRequest(requestId, isAdmin) {
  if (confirm("Are you sure you want to delete this support request?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/request/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        showToast("Support request deleted successfully!", "success")
        loadSupportRequests(isAdmin)
        loadDashboardData(isAdmin)
      } else {
        const data = await response.json()
        showToast(data.message || "Failed to delete support request", "error")
      }
    } catch (error) {
      console.error("Error deleting support request:", error)
      showToast("An error occurred. Please try again later.", "error")
    }
  }
}

async function editKnowledgeBaseArticle(articleId) {
  try {
    let editModal = document.getElementById("edit-kb-modal")

    if (!editModal) {
      const modalHtml = `
        <div class="modal" id="edit-kb-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Edit Knowledge Base Article</h3>
              <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
              <form id="edit-kb-form">
                <input type="hidden" id="edit-kb-id">
                <div class="form-group">
                  <label for="edit-kb-title">Title</label>
                  <input type="text" id="edit-kb-title" required>
                </div>
                <div class="form-group">
                  <label for="edit-kb-category">Category</label>
                  <select id="edit-kb-category" required>
                    <option value="">Select Category</option>
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="network">Network</option>
                    <option value="printer">Printer</option>
                    <option value="email">Email</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="edit-kb-symptoms">Symptoms (one per line)</label>
                  <textarea id="edit-kb-symptoms" rows="4" required></textarea>
                </div>
                <div class="form-group">
                  <label for="edit-kb-solution">Solution Steps (one per line)</label>
                  <textarea id="edit-kb-solution" rows="6" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Update Article</button>
              </form>
            </div>
          </div>
        </div>
      `

      document.body.insertAdjacentHTML("beforeend", modalHtml)

      document.querySelector("#edit-kb-modal .close-modal").addEventListener("click", () => {
        closeAllModals()
      })

      document.getElementById("edit-kb-form").addEventListener("submit", (e) => {
        e.preventDefault()
        saveEditedKnowledgeBase()
      })

      editModal = document.getElementById("edit-kb-modal")
    }

    const response = await fetch(`${API_BASE_URL}/knowledge/${articleId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const article = data.knowledgeBase

      document.getElementById("edit-kb-id").value = articleId
      document.getElementById("edit-kb-title").value = article.title
      document.getElementById("edit-kb-category").value = article.category

      let symptomsText = ""
      if (typeof article.symptoms === "object") {
        symptomsText = Object.values(article.symptoms).join("\n")
      }
      document.getElementById("edit-kb-symptoms").value = symptomsText

      let solutionText = ""
      if (typeof article.solutionSteps === "object") {
        solutionText = Object.values(article.solutionSteps).join("\n")
      }
      document.getElementById("edit-kb-solution").value = solutionText

      editModal.style.display = "block"
    } else {
      showToast("Failed to load article details", "error")
    }
  } catch (error) {
    console.error("Error editing knowledge base article:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function saveEditedKnowledgeBase() {
  const articleId = document.getElementById("edit-kb-id").value
  const title = document.getElementById("edit-kb-title").value
  const category = document.getElementById("edit-kb-category").value
  const symptomsText = document.getElementById("edit-kb-symptoms").value
  const solutionText = document.getElementById("edit-kb-solution").value

  const symptomsArray = symptomsText.split("\n").filter((line) => line.trim() !== "")
  const solutionArray = solutionText.split("\n").filter((line) => line.trim() !== "")

  const symptoms = {}
  symptomsArray.forEach((symptom, index) => {
    symptoms[index] = symptom
  })

  const solutionSteps = {}
  solutionArray.forEach((step, index) => {
    solutionSteps[index] = step
  })

  try {
    const response = await fetch(`${API_BASE_URL}/knowledge/${articleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title,
        category,
        symptoms,
        solutionSteps,
      }),
    })

    if (response.ok) {
      showToast("Knowledge base article updated successfully!", "success")
      closeAllModals()

      const adminElements = document.querySelectorAll(".admin-only")
      const isAdmin = !adminElements[0].classList.contains("hidden")

      loadKnowledgeBase(isAdmin)
    } else {
      const data = await response.json()
      showToast(data.message || "Failed to update article", "error")
    }
  } catch (error) {
    console.error("Error updating knowledge base article:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function deleteKnowledgeBaseArticle(articleId) {
  if (confirm("Are you sure you want to delete this knowledge base article?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge/${articleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        showToast("Knowledge base article deleted successfully!", "success")

        const adminElements = document.querySelectorAll(".admin-only")
        const isAdmin = !adminElements[0].classList.contains("hidden")

        loadKnowledgeBase(isAdmin)
      } else {
        const data = await response.json()
        showToast(data.message || "Failed to delete article", "error")
      }
    } catch (error) {
      console.error("Error deleting knowledge base article:", error)
      showToast("An error occurred. Please try again later.", "error")
    }
  }
}

async function loadUsers(isAdmin) {
  const userList = document.getElementById("user-list")
  userList.innerHTML = '<div class="loading">Loading users...</div>'

  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const users = data.users || []

      if (users.length === 0) {
        userList.innerHTML = '<p class="empty-state">No users found</p>'
        return
      }

      let html = ""

      users.forEach((user) => {
        html += `
        <div class="list-item" data-id="${user.id}">
            <div class="list-item-details">
            <div class="list-item-title">${user.name}</div>
            <div class="list-item-subtitle">Email: ${user.email} | Role: ${user.role}</div>
            </div>
            <div class="list-item-actions">
            <button class="btn btn-small view-user" data-id="${user.id}">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-small btn-danger delete-user" data-id="${user.id}">
                <i class="fas fa-trash"></i>
            </button>
            </div>
        </div>
        `
      })

      userList.innerHTML = html

      document.querySelectorAll(".view-user").forEach((btn) => {
        btn.addEventListener("click", () => {
          const userId = btn.getAttribute("data-id")
          viewUserDetails(userId)
        })
      })

      document.querySelectorAll(".delete-user").forEach((btn) => {
        btn.addEventListener("click", () => {
          const userId = btn.getAttribute("data-id")
          deleteUser(userId)
        })
      })
    } else {
      userList.innerHTML = '<p class="empty-state">Failed to load users</p>'
    }
  } catch (error) {
    console.error("Error loading users:", error)
    userList.innerHTML = '<p class="empty-state">An error occurred while loading users</p>'
  }
}

async function viewUserDetails(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const user = data.user

      const userDetailsContent = document.getElementById("user-details-content")
      const createdDate = new Date(user.createdAt).toLocaleString()

      userDetailsContent.innerHTML = `
        <div class="user-details">
        <div class="detail-group">
            <label>Name:</label>
            <p>${user.name}</p>
        </div>
        <div class="detail-group">
            <label>Email:</label>
            <p>${user.email}</p>
        </div>
        <div class="detail-group">
            <label>Role:</label>
            <p>${user.role}</p>
        </div>
        <div class="detail-group">
            <label>Account Type:</label>
            <p>${user.isBusiness ? "Business" : "Individual"}</p>
        </div>
        <div class="detail-group">
            <label>Address:</label>
            <p>${user.address}</p>
        </div>
        <div class="detail-group">
            <label>Registered On:</label>
            <p>${createdDate}</p>
        </div>
        </div>
    `

      openModal("user-modal")
    } else {
      showToast("Failed to load user details", "error")
    }
  } catch (error) {
    console.error("Error viewing user details:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

async function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        showToast("User deleted successfully!", "success")
        loadUsers()
      } else {
        showToast("Failed to delete user", "error")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      showToast("An error occurred. Please try again later.", "error")
    }
  }
}

function showToast(message, type = "info") {
  const toastElement = document.getElementById("toast")
  const toastMessage = document.querySelector(".toast-message")
  const toastIcon = document.querySelector(".toast-icon")

  toastMessage.textContent = message

  switch (type) {
    case "success":
      toastIcon.className = "fas fa-check-circle toast-icon"
      toastIcon.style.color = "var(--success-color)"
      break
    case "error":
      toastIcon.className = "fas fa-exclamation-circle toast-icon"
      toastIcon.style.color = "var(--danger-color)"
      break
    case "warning":
      toastIcon.className = "fas fa-exclamation-triangle toast-icon"
      toastIcon.style.color = "var(--warning-color)"
      break
    default:
      toastIcon.className = "fas fa-info-circle toast-icon"
      toastIcon.style.color = "var(--primary-color)"
  }

  toastElement.classList.add("show")

  setTimeout(() => {
    toastElement.classList.remove("show")
  }, 3000)
}