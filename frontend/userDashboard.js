let authToken = localStorage.getItem("authToken")
let id = localStorage.getItem("id")
let isLoggedIn = false
let isAdmin = false

const API_BASE_URL = "http://localhost:3000"

document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is already logged in
  if (authToken && id) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        isLoggedIn = true
        isAdmin = data.user.role === "admin"

        if (isAdmin) {
          window.location.href = "index.html"
          return
        }

        updateAuthUI(data.user.businessName || data.user.name)
      } else {
        localStorage.removeItem("authToken")
        localStorage.removeItem("id")
        authToken = null
        id = null
      }
    } catch (error) {
      console.error("Error verifying user:", error)
      localStorage.removeItem("authToken")
      localStorage.removeItem("id")
      authToken = null
      id = null
    }
  }

  setupEventListeners()
})

function updateAuthUI(name) {
  const loginLinks = document.querySelectorAll(".login-link")
  const registerLinks = document.querySelectorAll(".register-link")
  const logoutLinks = document.querySelectorAll(".logout-link")
  const userNameElement = document.querySelectorAll(".action-icon")[0]

  if (isLoggedIn) {
    loginLinks.forEach((link) => {
      link.style.display = "none"
    })
    registerLinks.forEach((link) => {
      link.style.display = "none"
    })
    logoutLinks.forEach((link) => {
      link.style.display = "inline"
    })
    const p = document.createElement("p")
    p.textContent = name
    p.style.margin = "0 0 0 10px"
    
    userNameElement.appendChild(p)
  } else {
    loginLinks.forEach((link) => {
      link.style.display = "inline"
    })
    registerLinks.forEach((link) => {
      link.style.display = "inline"
    })
    logoutLinks.forEach((link) => {
      link.style.display = "none"
    })
    userNameElement.removeChild(userNameElement.querySelector("p"))
  }
}

function setupEventListeners() {
  document.querySelectorAll(".login-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "index.html"
    })
  })

  document.querySelectorAll(".register-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "index.html?tab=register"
    })
  })

  document.querySelectorAll(".logout-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      handleLogout()
    })
  })

  document.querySelectorAll(".nav-item[data-page='support-requests']")[0].addEventListener("click", (e) => {
    e.preventDefault()
    console.log(document.querySelectorAll(".nav-item[data-page='support-requests']")[0]);
    
    if (isLoggedIn) {
      showModernSection("support-requests")
    } else {
      showToast("Please login to access support requests", "warning")
      window.location.href = "index.html"
    }
  })
  
  Array.from(document.getElementsByClassName("social-icon")).forEach((social) => {
    social.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("This service will be implemented very soon, stay connected.", "socials");
    });
  });
  
  Array.from(document.getElementsByClassName("future")).forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("This service will be implemented very soon, stay connected.", "socials");
    });
  });

  document.querySelectorAll(".user-articles, .nav-item[data-page='knowledge-base']").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Knowledge base link clicked");
      
      showModernSection("knowledge-base")
    })
  })

  document.querySelectorAll(".close-section-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionName = btn.getAttribute("data-section")
      hideModernSection(sectionName)
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

  document.querySelectorAll(".modern-section-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        const section = overlay.closest(".modern-section")
        if (section) {
          section.classList.remove("active")
        }
      }
    })
  })

  const newRequestBtn = document.getElementById("new-request-btn")
  if (newRequestBtn) {
    newRequestBtn.addEventListener("click", () => {
      if (isLoggedIn) {
        openModal("request-modal")
      } else {
        showToast("Please login to create a support request", "warning")
        window.location.href = "index.html"
      }
    })
  }

  const requestForm = document.getElementById("request-form")
  if (requestForm) {
    requestForm.addEventListener("submit", (e) => {
      e.preventDefault()
      createSupportRequest()
    })
  }

  document.querySelectorAll(".kb-filter").forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.getAttribute("data-filter")
      filterKnowledgeBase(filterValue)
    })
  })

  const kbSearchBtn = document.getElementById("kb-search-btn")
  if (kbSearchBtn) {
    kbSearchBtn.addEventListener("click", () => {
      const searchQuery = document.getElementById("kb-search").value
      searchKnowledgeBase(searchQuery)
    })
  }

  const kbSearchInput = document.getElementById("kb-search")
  if (kbSearchInput) {
    kbSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchKnowledgeBase(e.target.value)
      }
    })
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modern-section.active").forEach((section) => {
        section.classList.remove("active")
      })
      closeAllModals()
    }
  })

  document.querySelectorAll(".mobile-nav .user-request").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      document.querySelector(".mobile-menu").classList.remove("active")

      if (isLoggedIn) {
        showModernSection("support-requests")
      } else {
        showToast("Please login to access support requests", "warning")
        window.location.href = "index.html"
      }
    })
  })

  document.querySelectorAll(".mobile-nav .user-articles").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      document.querySelector(".mobile-menu").classList.remove("active")

      showModernSection("knowledge-base")
    })
  })

  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
  const mobileMenu = document.querySelector(".mobile-menu")
  const mobileMenuClose = document.querySelector(".mobile-menu-close")

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenu.classList.add("active")
    })
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", () => {
      mobileMenu.classList.remove("active")
    })
  }
}

function showModernSection(sectionName) {
  const section = document.getElementById(`${sectionName}-section`)
  
  if (section) {
    section.classList.add("active")
    
    if (sectionName === "support-requests") {
      loadSupportRequests()
    } else if (sectionName === "knowledge-base") {
      loadKnowledgeBase()
    }
  }
}

function hideModernSection(sectionName) {
  const section = document.getElementById(`${sectionName}-section`)
  if (section) {
    section.classList.remove("active")
  }
}

function handleLogout() {
  localStorage.removeItem("authToken")
  localStorage.removeItem("id")
  authToken = null
  id = null
  isLoggedIn = false
  isAdmin = false

  updateAuthUI()
  showToast("Logged out successfully", "success")
}

async function createSupportRequest() {
  if (!isLoggedIn) {
    showToast("Please login to create a support request", "warning")
    window.location.href = "index.html"
    return
  }

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

async function loadSupportRequests() {
    console.log("Loading support requests...");
    
  const requestList = document.getElementById("request-list")
  requestList.innerHTML = '<div class="loading">Loading requests...</div>'

  if (!isLoggedIn) {
    requestList.innerHTML = '<p class="empty-state">Please login to view your support requests</p>'
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/request/my-requests`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log(data);
      
      const requests = data.requests || []

      if (requests.length === 0) {
        requestList.innerHTML = '<p class="empty-state">No support requests found. Create your first request!</p>'
        return
      }

      let html = ""

      requests.forEach((request) => {
        const date = new Date(request.scheduledDate)
        const formattedDate =
          date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

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
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                `
      })

      requestList.innerHTML = html

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

async function loadKnowledgeBase() {
  const kbList = document.getElementById("kb-list")
  kbList.innerHTML = '<div class="loading">Loading knowledge base articles...</div>'

  try {
    const headers = {}
    if (isLoggedIn && authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}/knowledge`, {
      headers: headers,
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
                            <div class="list-item-subtitle">${article.category}</div>
                        </div>
                        <div class="list-item-actions">
                            <button class="btn btn-small view-kb" data-id="${article.id}">
                                <i class="fas fa-eye"></i> Read
                            </button>
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
    } else {
      kbList.innerHTML = '<p class="empty-state" style="padding:10px;">Failed to load knowledge base articles. Login first</p>'
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

function searchKnowledgeBase(query) {
  query = query.toLowerCase().trim()
  const articles = document.querySelectorAll(".kb-item")

  if (!query) {
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

async function viewKnowledgeBaseArticle(articleId) {
  try {
    const headers = {}
    if (isLoggedIn && authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}/knowledge/${articleId}`, {
      headers: headers,
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

function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none"
  })
}

function showToast(message, type = "info") {
  const toastElement = document.getElementById("toast")
  const toastMessage = document.querySelector(".toast-message")
  const toastIcon = document.querySelector(".toast-icon")

  toastMessage.textContent = message

  switch (type) {
    case "success":
      toastIcon.className = "fas fa-check-circle toast-icon"
      toastIcon.style.color = "#10b981"
      break
    case "error":
      toastIcon.className = "fas fa-exclamation-circle toast-icon"
      toastIcon.style.color = "#ef4444"
      break
    case "warning":
      toastIcon.className = "fas fa-exclamation-triangle toast-icon"
      toastIcon.style.color = "#f59e0b"
      break
    case "socials":
      toastIcon.className = "fas fa-exclamation-triangle toast-icon"
      toastIcon.style.color = "#f59e0b"
      break
    default:
      toastIcon.className = "fas fa-info-circle toast-icon"
      toastIcon.style.color = "#2563eb"
  }

  toastElement.classList.add("show")

  setTimeout(() => {
    toastElement.classList.remove("show")
  }, 4000)
}
