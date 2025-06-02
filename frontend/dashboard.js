// Global variables
const API_BASE_URL = "http://localhost:3000"
const authToken = localStorage.getItem("authToken")
const userId = localStorage.getItem("id")

// DOM Elements
const fixStuffLink = document.getElementById("fix-stuff-link")
const articlesLink = document.getElementById("articles-link")
const supportRequestsPage = document.getElementById("support-requests-page")
const knowledgeBasePage = document.getElementById("knowledge-base-page")
const logoutBtn = document.querySelector(".logout-btn")
const newRequestBtn = document.getElementById("new-request-btn")
const requestForm = document.getElementById("request-form")
const kbFilters = document.querySelectorAll(".kb-filter")
const kbSearchBtn = document.getElementById("kb-search-btn")
const kbSearchInput = document.getElementById("kb-search")
const toast = document.getElementById("toast")
const userName = document.getElementById("user-name")

// Check authentication on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Redirect to login if not authenticated
  if (!authToken) {
    window.location.href = "index.html"
    return
  }

  // Fetch user data and update UI
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.user && data.user.name) {
        userName.textContent = data.user.name
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  // Set up event listeners
  setupEventListeners()

  // Show support requests page by default
  showPage("support-requests")
})

// Set up all event listeners
function setupEventListeners() {
  // Navigation
  fixStuffLink.addEventListener("click", (e) => {
    e.preventDefault()
    showPage("support-requests")
  })

  articlesLink.addEventListener("click", (e) => {
    e.preventDefault()
    showPage("knowledge-base")
  })

  // Logout
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault()
    handleLogout()
  })

  // New request
  if (newRequestBtn) {
    newRequestBtn.addEventListener("click", () => {
      openModal("request-modal")
    })
  }

  // Request form submission
  if (requestForm) {
    requestForm.addEventListener("submit", (e) => {
      e.preventDefault()
      createSupportRequest()
    })
  }

  // Knowledge base filters
  kbFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.getAttribute("data-filter")
      filterKnowledgeBase(filterValue)
    })
  })

  // Knowledge base search
  if (kbSearchBtn) {
    kbSearchBtn.addEventListener("click", () => {
      searchKnowledgeBase(kbSearchInput.value)
    })
  }

  if (kbSearchInput) {
    kbSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchKnowledgeBase(kbSearchInput.value)
      }
    })
  }

  // Close modals
  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllModals()
    })
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
    })
  })
}

// Show the specified page and load its data
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active")
  })

  // Update navigation links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active")
  })

  // Show selected page and update active link
  if (pageId === "support-requests") {
    supportRequestsPage.classList.add("active")
    fixStuffLink.classList.add("active")
    loadSupportRequests()
  } else if (pageId === "knowledge-base") {
    knowledgeBasePage.classList.add("active")
    articlesLink.classList.add("active")
    loadKnowledgeBase()
  }
}

// Handle user logout
function handleLogout() {
  localStorage.removeItem("authToken")
  localStorage.removeItem("id")
  window.location.href = "index.html"
}

// Load support requests
async function loadSupportRequests() {
  const requestList = document.getElementById("request-list")
  requestList.innerHTML = '<div class="loading">Loading requests...</div>'

  try {
    const response = await fetch(`${API_BASE_URL}/request/my-requests`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const requests = data.requests || []

      if (requests.length === 0) {
        requestList.innerHTML = '<p class="empty-state">No support requests found</p>'
        return
      }

      let html = ""
      requests.forEach((request) => {
        const date = new Date(request.scheduledDate)
        const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString()

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
                        </div>
                    </div>
                `
      })

      requestList.innerHTML = html

      // Add event listeners to view buttons
      document.querySelectorAll(".view-request").forEach((btn) => {
        btn.addEventListener("click", () => {
          const requestId = btn.getAttribute("data-id")
          viewRequestDetails(requestId)
        })
      })
    } else {
      requestList.innerHTML = '<p class="empty-state">Failed to load support requests</p>'
    }
  } catch (error) {
    console.error("Error loading support requests:", error)
    requestList.innerHTML = '<p class="empty-state">An error occurred while loading requests</p>'
  }
}

// Create a new support request
async function createSupportRequest() {
  const deviceType = document.getElementById("device-type").value
  const problemDescription = document.getElementById("problem-description").value
  const scheduledDate = document.getElementById("scheduled-date").value

  if (!deviceType || !problemDescription || !scheduledDate) {
    showToast("Please fill in all required fields", "error")
    return
  }

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
      loadSupportRequests()
    } else {
      showToast(data.message || "Failed to create support request", "error")
    }
  } catch (error) {
    console.error("Error creating support request:", error)
    showToast("An error occurred. Please try again later.", "error")
  }
}

// View support request details
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

// Load knowledge base articles
async function loadKnowledgeBase() {
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
                        </div>
                    </div>
                `
      })

      kbList.innerHTML = html

      // Add event listeners to view buttons
      document.querySelectorAll(".view-kb").forEach((btn) => {
        btn.addEventListener("click", () => {
          const articleId = btn.getAttribute("data-id")
          viewKnowledgeBaseArticle(articleId)
        })
      })
    } else {
      kbList.innerHTML = '<p class="empty-state">Failed to load knowledge base articles</p>'
    }
  } catch (error) {
    console.error("Error loading knowledge base:", error)
    kbList.innerHTML = '<p class="empty-state">An error occurred while loading articles</p>'
  }
}

// Filter knowledge base articles by category
function filterKnowledgeBase(filter) {
  // Update active filter button
  document.querySelectorAll(".kb-filter").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`.kb-filter[data-filter="${filter}"]`).classList.add("active")

  // Filter articles
  const articles = document.querySelectorAll(".kb-item")
  articles.forEach((article) => {
    if (filter === "all" || article.getAttribute("data-category") === filter) {
      article.style.display = "flex"
    } else {
      article.style.display = "none"
    }
  })
}

// Search knowledge base articles
function searchKnowledgeBase(query) {
  query = query.toLowerCase().trim()
  const articles = document.querySelectorAll(".kb-item")

  if (!query) {
    // Reset filter to show all articles
    filterKnowledgeBase("all")
    return
  }

  articles.forEach((article) => {
    const title = article.querySelector(".list-item-title").textContent.toLowerCase()
    const category = article.getAttribute("data-category").toLowerCase()

    if (title.includes(query) || category.includes(query)) {
      article.style.display = "flex"
    } else {
      article.style.display = "none"
    }
  })
}

// View knowledge base article details
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

// Open a modal
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"
  }
}

// Close all modals
function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none"
  })
}

// Show toast notification
function showToast(message, type = "info") {
  const toastElement = document.getElementById("toast")
  const toastMessage = document.querySelector(".toast-message")
  const toastIcon = document.querySelector(".toast-icon")

  toastMessage.textContent = message

  // Set icon and color based on notification type
  switch (type) {
    case "success":
      toastIcon.className = "fas fa-check-circle toast-icon"
      toastIcon.style.color = "#28a745"
      break
    case "error":
      toastIcon.className = "fas fa-exclamation-circle toast-icon"
      toastIcon.style.color = "#dc3545"
      break
    case "warning":
      toastIcon.className = "fas fa-exclamation-triangle toast-icon"
      toastIcon.style.color = "#ffc107"
      break
    default:
      toastIcon.className = "fas fa-info-circle toast-icon"
      toastIcon.style.color = "#0071CE"
  }

  toastElement.classList.add("show")

  // Hide toast after 3 seconds
  setTimeout(() => {
    toastElement.classList.remove("show")
  }, 3000)
}
