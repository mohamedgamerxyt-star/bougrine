// بيانات تسجيل دخول الأدمن الافتراضية
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";

// عناصر الواجهة
const loginSelection = document.getElementById("login-selection");
const adminForm = document.getElementById("admin-form");
const guestForm = document.getElementById("guest-form");
const mainContent = document.getElementById("main-content");
const postCreationArea = document.getElementById("post-creation-area");

// معلومات المستخدم الحالي
let currentUser = null;
let currentRole = null; // 'admin' أو 'guest'

// التنقل بين الشاشات
function showAdminForm() {
    loginSelection.classList.add("hidden");
    adminForm.classList.remove("hidden");
}

function showGuestForm() {
    loginSelection.classList.add("hidden");
    guestForm.classList.remove("hidden");
}

function goBack() {
    adminForm.classList.add("hidden");
    guestForm.classList.add("hidden");
    loginSelection.classList.remove("hidden");
}

// تسجيل دخول الأدمن
function loginAdmin() {
    const user = document.getElementById("admin-user").value;
    const pass = document.getElementById("admin-pass").value;

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        currentUser = "الأدمن";
        currentRole = "admin";
        openApp();
    } else {
        alert("اسم المستخدم أو كلمة السر غير صحيحة!");
    }
}

// دخول الضيف
function loginGuest() {
    const name = document.getElementById("guest-name").value.trim();

    if (name !== "") {
        currentUser = name;
        currentRole = "guest";
        openApp();
    } else {
        alert("يرجى كتابة اسمك أولاً.");
    }
}

// فتح الواجهة الرئيسية
function openApp() {
    loginSelection.classList.add("hidden");
    adminForm.classList.add("hidden");
    guestForm.classList.add("hidden");
    mainContent.classList.remove("hidden");

    document.getElementById("user-display-name").innerText = currentUser;
    document.getElementById("user-role").innerText = currentRole === "admin" ? "(أدمن)" : "(ضيف)";

    if (currentRole === "admin") {
        postCreationArea.classList.remove("hidden");
    } else {
        postCreationArea.classList.add("hidden");
    }

    loadPosts();
}

// إضافة منشور جديد بواسطة الأدمن
function addPost() {
    const postText = document.getElementById("post-text").value.trim();
    const imageInput = document.getElementById("post-image");
    const file = imageInput.files[0];

    if (postText === "" && !file) {
        alert("يرجى إضافة نص أو اختيار صورة للنشر.");
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            savePost(postText, e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        savePost(postText, null);
    }
}

// حفظ المنشور في LocalStorage
function savePost(text, imageData) {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    
    posts.unshift({
        id: Date.now(),
        author: currentUser,
        text: text,
        image: imageData,
        date: new Date().toLocaleString("ar-EG"),
        comments: []
    });

    try {
        localStorage.setItem("posts", JSON.stringify(posts));
        document.getElementById("post-text").value = "";
        document.getElementById("post-image").value = "";
        loadPosts();
    } catch (err) {
        alert("حجم الصورة كبير جداً، يرجى اختيار صورة بحجم أصغر.");
    }
}

// إضافة تعليق على منشور محدد (للجميع)
function addComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const commentText = commentInput.value.trim();

    if (commentText === "") {
        alert("لا يمكنك إضافة تعليق فارغ.");
        return;
    }

    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const targetPost = posts.find(p => p.id === postId);

    if (targetPost) {
        if (!targetPost.comments) targetPost.comments = [];
        
        targetPost.comments.push({
            author: currentUser,
            text: commentText,
            date: new Date().toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })
        });

        localStorage.setItem("posts", JSON.stringify(posts));
        commentInput.value = "";
        loadPosts();
    }
}

// تحميل وعرض المنشورات والتعليقات
function loadPosts() {
    const postsContainer = document.getElementById("posts-container");
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");

    postsContainer.innerHTML = "";

    if (posts.length === 0) {
        postsContainer.innerHTML = "<p style='color: #8b949e;'>لا توجد منشورات حتى الآن.</p>";
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.className = "post";
        
        let imageHTML = post.image ? `<img src="${post.image}" class="post-img" alt="صورة المنشور">` : '';

        let commentsHTML = "";
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(c => {
                commentsHTML += `
                    <div class="comment">
                        <div class="comment-author">${c.author} <small style="color: #8b949e; font-weight: normal;">(${c.date})</small></div>
                        <div>${c.text}</div>
                    </div>
                `;
            });
        } else {
            commentsHTML = `<p style="color: #8b949e; font-size: 0.85em;">لا توجد تعليقات بعد.</p>`;
        }

        postElement.innerHTML = `
            <div class="post-author">بواسطة: ${post.author} | ${post.date}</div>
            ${post.text ? `<p>${post.text}</p>` : ''}
            ${imageHTML}

            <div class="comments-section">
                <h4 style="font-size: 0.9em; margin-bottom: 8px; color: #8b949e;">التعليقات:</h4>
                <div class="comments-list">
                    ${commentsHTML}
                </div>
                <div class="comment-input-box">
                    <input type="text" id="comment-input-${post.id}" placeholder="اكتب تعليقاً باسم ${currentUser}...">
                    <button onclick="addComment(${post.id})" class="btn btn-primary">تعليق</button>
                </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

// تسجيل الخروج
function logout() {
    currentUser = null;
    currentRole = null;
    mainContent.classList.add("hidden");
    loginSelection.classList.remove("hidden");
}