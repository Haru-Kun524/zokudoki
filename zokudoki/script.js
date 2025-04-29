// サイドメニューの制御
const menuToggle = document.querySelector('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const closeMenu = document.querySelector('.close-menu');

menuToggle.addEventListener('click', function() {
    sideMenu.classList.add('active');
    menuToggle.classList.add('active');
});

closeMenu.addEventListener('click', function() {
    sideMenu.classList.remove('active');
    menuToggle.classList.remove('active');
});

// メニュー外をクリックしたときにメニューを閉じる
document.addEventListener('click', function(e) {
    if (!sideMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        sideMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// 投稿モーダルの制御
const postModal = document.getElementById('postModal');
const createPostBtn = document.getElementById('create-post');
const closeModal = document.querySelector('.close-modal');
const postForm = document.getElementById('postForm');

createPostBtn.addEventListener('click', function(e) {
    e.preventDefault();
    postModal.style.display = 'block';
});

closeModal.addEventListener('click', function() {
    postModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target == postModal) {
        postModal.style.display = 'none';
    }
});

// セクション切り替え
document.querySelectorAll('.nav-tabs a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        
        // アクティブなタブを更新
        document.querySelectorAll('.nav-tabs a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
        
        // セクションの表示を切り替え
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
    });
});

// 投稿の保存と表示
let posts = JSON.parse(localStorage.getItem('posts')) || [];

function savePost(post) {
    posts.unshift(post); // 新しい投稿を先頭に追加
    localStorage.setItem('posts', JSON.stringify(posts));
    displayPosts();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}-${hours}:${minutes}`;
}

function createPostElement(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    
    postCard.innerHTML = `
        <div class="post-content">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-description">${post.description}</p>
            <div class="post-meta">
                <span class="post-genre ${post.genre}">${getGenreName(post.genre)}</span>
                <button class="read-more-btn" data-post-id="${post.date}">続きを読む</button>
            </div>
        </div>
    `;

    // 続きを読むボタンのイベントリスナー
    const readMoreBtn = postCard.querySelector('.read-more-btn');
    readMoreBtn.addEventListener('click', () => showPostDetail(post));

    return postCard;
}

function getGenreName(genre) {
    const genres = {
        'gore': 'グロ',
        'accident': '事故',
        'funny': '面白'
    };
    return genres[genre] || genre;
}

function sortPosts(posts, order) {
    return [...posts].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
}

function displayPosts() {
    // 各投稿コンテナをクリア
    document.querySelectorAll('.posts-container').forEach(container => {
        container.innerHTML = '';
    });

    // フィルターの値を取得
    const homeFilter = document.getElementById('homeFilter').value;
    const goreFilter = document.getElementById('goreFilter').value;
    const accidentFilter = document.getElementById('accidentFilter').value;
    const funnyFilter = document.getElementById('funnyFilter').value;

    // ホーム画面には全ての投稿を表示（フィルター適用）
    const homeContainer = document.getElementById('homePosts');
    const sortedHomePosts = sortPosts(posts, homeFilter);
    sortedHomePosts.forEach(post => {
        homeContainer.appendChild(createPostElement(post));
    });

    // ジャンル別の投稿を表示（フィルター適用）
    const gorePosts = sortPosts(posts.filter(post => post.genre === 'gore'), goreFilter);
    const accidentPosts = sortPosts(posts.filter(post => post.genre === 'accident'), accidentFilter);
    const funnyPosts = sortPosts(posts.filter(post => post.genre === 'funny'), funnyFilter);

    gorePosts.forEach(post => {
        document.getElementById('gorePosts').appendChild(createPostElement(post));
    });

    accidentPosts.forEach(post => {
        document.getElementById('accidentPosts').appendChild(createPostElement(post));
    });

    funnyPosts.forEach(post => {
        document.getElementById('funnyPosts').appendChild(createPostElement(post));
    });
}

// フィルター変更時のイベントリスナー
document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', displayPosts);
});

// 投稿フォームの送信処理
postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const genre = document.getElementById('postGenre').value;
    const mediaFile = document.getElementById('postMedia').files[0];
    const description = document.getElementById('postDescription').value;

    // メディアファイルをBase64に変換
    const reader = new FileReader();
    reader.onload = function(e) {
        const post = {
            title,
            genre,
            media: {
                type: mediaFile.type,
                url: e.target.result
            },
            description,
            date: new Date().toISOString()
        };

        savePost(post);
        postForm.reset();
        postModal.style.display = 'none';
    };

    reader.readAsDataURL(mediaFile);
});

// 初期表示
displayPosts();

// 既存のコード
document.querySelector('.search-icon').addEventListener('click', function() {
    document.querySelector('.search-bar').classList.toggle('active');
});

document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-tabs').classList.toggle('active');
});

// ホラーっぽい演出: ランダムにちらつく効果
setInterval(() => {
    if (Math.random() < 0.1) {
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 50);
    }
}, 3000);

function showPostDetail(post) {
    // メインコンテンツを非表示
    document.querySelector('.content-area').style.display = 'none';
    
    // 詳細ページを表示
    const detailPage = document.getElementById('postDetailPage');
    detailPage.style.display = 'block';
    
    // 投稿の詳細を表示
    const mediaElement = post.media.type.startsWith('image') 
        ? `<img src="${post.media.url}" alt="${post.title}">`
        : `<video src="${post.media.url}" controls></video>`;

    detailPage.querySelector('.post-detail-title').textContent = post.title;
    detailPage.querySelector('.post-detail-media').innerHTML = mediaElement;
    detailPage.querySelector('.post-detail-description').textContent = post.description;
    detailPage.querySelector('.post-detail-genre').textContent = getGenreName(post.genre);
    detailPage.querySelector('.post-detail-genre').className = `post-detail-genre ${post.genre}`;
    detailPage.querySelector('.post-detail-date').textContent = formatDate(post.date);

    // 戻るボタンのイベントリスナー
    const backButton = detailPage.querySelector('.back-button');
    backButton.onclick = () => {
        detailPage.style.display = 'none';
        document.querySelector('.content-area').style.display = 'block';
    };
}
