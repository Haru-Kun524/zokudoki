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

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('初期化開始');
    
    // 投稿ボタンの表示制御
    updatePostButtonVisibility();

    // 投稿モーダルの制御
    const postModal = document.getElementById('postModal');
    const createPostBtn = document.getElementById('create-post');
    const closeModal = document.querySelector('.close-modal');

    // 新規投稿ボタンのイベントリスナー
    if (createPostBtn) {
        createPostBtn.addEventListener('click', function() {
            console.log('新規投稿ボタンがクリックされました');
            postModal.style.display = 'block';
        });
    }

    // モーダルを閉じるボタンのイベントリスナー
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            postModal.style.display = 'none';
        });
    }

    // モーダルの外側をクリックしたときに閉じる
    window.addEventListener('click', function(e) {
        if (e.target === postModal) {
            postModal.style.display = 'none';
        }
    });

    // 投稿フォームの送信処理
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('フォーム送信開始');

            const title = document.getElementById('postTitle').value;
            const genre = document.getElementById('postGenre').value;
            const mediaFile = document.getElementById('postMedia').files[0];
            const description = document.getElementById('postDescription').value;

            console.log('入力値:', { title, genre, description });

            if (!mediaFile) {
                alert('メディアファイルを選択してください');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('ファイル読み込み完了');
                const post = {
                    id: Date.now().toString(),
                    title: title,
                    genre: genre,
                    media: {
                        type: mediaFile.type,
                        url: e.target.result
                    },
                    description: description,
                    date: new Date().toISOString()
                };

                console.log('投稿データ:', post);

                // 投稿を保存
                let posts = JSON.parse(localStorage.getItem('posts') || '[]');
                posts.unshift(post);
                localStorage.setItem('posts', JSON.stringify(posts));
                console.log('投稿を保存しました');

                // 投稿を表示
                displayPosts();
                console.log('投稿を表示しました');

                // フォームをリセットしてモーダルを閉じる
                postForm.reset();
                postModal.style.display = 'none';
            };

            reader.onerror = function(error) {
                console.error('ファイル読み込みエラー:', error);
                alert('ファイルの読み込みに失敗しました');
            };

            reader.readAsDataURL(mediaFile);
        });
    }

    // 初期投稿の表示
    displayPosts();
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
let currentCategory = null;

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

function createPostCard(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    postCard.dataset.id = post.id;
    postCard.dataset.genre = post.genre;

    // 投稿内容のコンテナを作成
    const postContent = document.createElement('div');
    postContent.className = 'post-content';

    // タイトル
    const title = document.createElement('h3');
    title.className = 'post-title';
    title.textContent = post.title;

    // 説明
    const description = document.createElement('p');
    description.className = 'post-description';
    description.textContent = post.description;

    // メタ情報コンテナ
    const postMeta = document.createElement('div');
    postMeta.className = 'post-meta';

    // ジャンル
    const genre = document.createElement('span');
    genre.className = `post-genre ${post.genre}`;
    genre.textContent = getGenreName(post.genre);

    // 続きを読むボタン
    const readMoreBtn = document.createElement('button');
    readMoreBtn.className = 'read-more-btn';
    readMoreBtn.textContent = '続きを読む';
    readMoreBtn.addEventListener('click', () => showPostDetail(post));

    // 削除ボタン（管理者のみ表示）
    if (isAdmin) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-post-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            if (confirm('この投稿を削除してもよろしいですか？')) {
                deletePost(post.id);
            }
        };
        postCard.appendChild(deleteButton);
    }

    // 要素を組み立てる
    postMeta.appendChild(genre);
    postMeta.appendChild(readMoreBtn);
    postContent.appendChild(title);
    postContent.appendChild(description);
    postContent.appendChild(postMeta);
    postCard.appendChild(postContent);

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
        homeContainer.appendChild(createPostCard(post));
    });

    // ジャンル別の投稿を表示（フィルター適用）
    const gorePosts = sortPosts(posts.filter(post => post.genre === 'gore'), goreFilter);
    const accidentPosts = sortPosts(posts.filter(post => post.genre === 'accident'), accidentFilter);
    const funnyPosts = sortPosts(posts.filter(post => post.genre === 'funny'), funnyFilter);

    gorePosts.forEach(post => {
        document.getElementById('gorePosts').appendChild(createPostCard(post));
    });

    accidentPosts.forEach(post => {
        document.getElementById('accidentPosts').appendChild(createPostCard(post));
    });

    funnyPosts.forEach(post => {
        document.getElementById('funnyPosts').appendChild(createPostCard(post));
    });
}

// フィルター変更時のイベントリスナー
document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', displayPosts);
});

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
    saveToHistory(post);
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

    // カテゴリーのクリックイベント
    const categoryElement = detailPage.querySelector('.post-detail-genre');
    categoryElement.addEventListener('click', () => {
        filterPostsByCategory(post.genre);
        showPostList(); // Return to post list with category filter applied
    });

    // 戻るボタンのイベントリスナー
    const backButton = detailPage.querySelector('.back-button');
    backButton.onclick = () => {
        detailPage.style.display = 'none';
        document.querySelector('.content-area').style.display = 'block';
    };
}

function showPostList() {
    document.getElementById('postDetailPage').style.display = 'none';
    document.querySelector('.content-area').style.display = 'block';
    displayPosts();
}

function filterPostsByCategory(category) {
    currentCategory = category;
    updatePostList();
}

function updatePostList() {
    // カテゴリーでフィルタリングされた投稿を表示
    const filteredPosts = currentCategory 
        ? posts.filter(post => post.genre === currentCategory)
        : posts;
    
    // 各投稿コンテナをクリア
    document.querySelectorAll('.posts-container').forEach(container => {
        container.innerHTML = '';
    });
    
    // フィルタリングされた投稿を表示
    const homeContainer = document.getElementById('homePosts');
    filteredPosts.forEach(post => {
        homeContainer.appendChild(createPostCard(post));
    });
}

// 管理者機能
let isAdmin = false; // デフォルトでは非管理者

// パスワード認証処理
document.getElementById('unume-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const passwordModal = document.getElementById('passwordModal');
    passwordModal.style.display = 'block';
    document.getElementById('password').focus();
});

// パスワード入力の処理
document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === 'Story-1201-0524') {
        isAdmin = true;
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('adminMenuModal').style.display = 'block';
        updateAdminUI();
    } else {
        document.getElementById('password').value = '';
    }
});

// 管理者メニューのボタン処理
document.getElementById('newPostBtn').addEventListener('click', function() {
    document.getElementById('adminMenuModal').style.display = 'none';
    document.getElementById('postModal').style.display = 'block';
});

document.getElementById('deletePostBtn').addEventListener('click', function() {
    document.getElementById('adminMenuModal').style.display = 'none';
    // 削除モードを有効にする
    enableDeleteMode();
});

// 削除モードの有効化
function enableDeleteMode() {
    const posts = document.querySelectorAll('.post-card');
    posts.forEach(post => {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-post-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            if (confirm('この投稿を削除してもよろしいですか？')) {
                deletePost(post.dataset.id);
            }
        };
        post.appendChild(deleteButton);
    });
}

// モーダルを閉じる処理
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('password').value = '';
        }
    });
});

// モーダルの外側をクリックしたときに閉じる
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.getElementById('password').value = '';
    }
});

// 投稿ボタンの表示制御
function updatePostButtonVisibility() {
    const createPostButton = document.getElementById('create-post');
    if (createPostButton) {
        createPostButton.style.display = isAdmin ? 'flex' : 'none';
    }
}

// 投稿の削除処理
function deletePost(postId) {
    if (!isAdmin) return;

    console.log('削除開始:', postId);
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    console.log('現在の投稿数:', posts.length);
    
    const updatedPosts = posts.filter(post => post.id !== postId);
    console.log('削除後の投稿数:', updatedPosts.length);
    
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    displayPosts();
    console.log('投稿を削除しました');
}

// 初期化時に管理者機能を設定
document.addEventListener('DOMContentLoaded', () => {
    updatePostButtonVisibility();
    // ... existing initialization code ...
});

// 履歴の保存
function saveToHistory(post) {
    let history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
    
    // 重複を避けるために既存の同じIDの履歴を削除
    history = history.filter(item => item.id !== post.id);
    
    // 新しい履歴を先頭に追加
    history.unshift({
        id: post.id,
        title: post.title,
        genre: post.genre,
        date: new Date().toISOString()
    });
    
    // 履歴を最大50件に制限
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('viewHistory', JSON.stringify(history));
}

// 履歴の表示
function displayHistory() {
    const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
    const historyContainer = document.getElementById('historyPosts');
    
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">閲覧履歴はありません</p>';
        return;
    }
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-content">
                <span class="history-genre ${item.genre}">${getGenreName(item.genre)}</span>
                <h3 class="history-title">${item.title}</h3>
                <span class="history-date">${formatDate(item.date)}</span>
            </div>
            <button class="view-history-btn" data-id="${item.id}">表示</button>
        `;
        historyContainer.appendChild(historyItem);
    });
    
    // 履歴アイテムのクリックイベント
    document.querySelectorAll('.view-history-btn').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.dataset.id;
            const posts = JSON.parse(localStorage.getItem('posts') || '[]');
            const post = posts.find(p => p.id === postId);
            if (post) {
                showPostDetail(post);
            }
        });
    });
}

// 履歴ページの表示
document.querySelector('a[href="#history"]').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('history').classList.add('active');
    displayHistory();
}); 