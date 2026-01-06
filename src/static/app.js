document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsList = details.participants.length > 0 
          ? `<ul class="participants-list">${details.participants.map(p => `<li style='list-style-type:none;display:flex;align-items:center;'>${p} <span class='delete-icon' title='删除' data-activity='${name}' data-email='${p}' style='margin-left:8px;cursor:pointer;'>&#128465;</span></li>`).join('')}</ul>` 
          : '<p>暂无参与者</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // 注册成功后刷新活动列表
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // 删除参与者事件委托
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-icon")) {
      const activity = event.target.getAttribute("data-activity");
      const email = event.target.getAttribute("data-email");
      if (confirm(`确定要移除 ${email} 吗？`)) {
        try {
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
            method: "POST"
          });
          const result = await response.json();
          if (response.ok) {
            messageDiv.textContent = result.message;
            messageDiv.className = "success";
          } else {
            messageDiv.textContent = result.detail || "注销失败";
            messageDiv.className = "error";
          }
          messageDiv.classList.remove("hidden");
          setTimeout(() => {
            messageDiv.classList.add("hidden");
          }, 3000);
          // 刷新活动列表
          await fetchActivities();
        } catch (error) {
          messageDiv.textContent = "请求失败，请重试。";
          messageDiv.className = "error";
          messageDiv.classList.remove("hidden");
        }
      }
    }
  });

  // Initialize app
  fetchActivities();
});
