// GitHub 클래스 정의
class Github {
    // 생성자에서 GitHub API에 사용될 클라이언트 ID와 시크릿 키를 설정
    constructor() {
        this.client_id = '4905e3a24606033c122f';
        this.client_secret = '066dce2629721724b48114922d21c2c635b46295';
    }

    async getUser(user) {
        
            // 사용자 프로필 정보를 가져오는 API 호출
            const profileResponse = await fetch(`https://api.github.com/users/${user}?client_id=${this.client_id}&client_secret=${this.client_secret}`);
            // 사용자의 레포지토리 정보를 가져오는 API 호출
            const reposResponse = await fetch(`https://api.github.com/users/${user}/repos?client_id=${this.client_id}&client_secret=${this.client_secret}`);
            
            if (!profileResponse.ok) {
                throw new Error(`GitHub API 요청이 실패했습니다. 상태 코드: ${profileResponse.status}`);
            }

            // 사용자 프로필 정보를 JSON 형식으로 변환
            const profile = await profileResponse.json();
            // 사용자의 레포지토리 정보를 JSON 형식으로 변환
            const repos = await reposResponse.json();
            
            
            if (!reposResponse.ok) {
                throw new Error(`GitHub API 요청이 실패했습니다. 상태 코드: ${reposResponse.status}`);
            }

            // 사용자 프로필과 레포지토리 정보를 함께 반환
            return { profile, repos };
        
    }
}

// init github
const github = new Github();
// init ui class
const ui = new UI();

// 검색 입력란
const searchUser = document.getElementById('searchUser');

// 검색 입력 이벤트 리스너
searchUser.addEventListener('keyup', (e) => {
    // 입력된 텍스트 가져오기
    const userText = e.target.value;
    if (userText !== '') {
        // HTTP 호출
        github.getUser(userText)
            .then(data => {
                if (data.profile.message === 'Not Found') {
                    // 알림 표시
                    ui.showAlert('사용자를 찾을 수 없습니다', 'alert alert-danger');
                } else {
                    // 프로필 표시
                    ui.showProfile(data.profile);
                    //레포지토리 표시
                    ui.showRepos(data.repos);
                }
            });
    } else {
        // 프로필 지우기
        ui.clearProfile();
    }
});

class UI {
    // UI 클래스의 생성자
    constructor() {
        // 프로필 요소를 가져와서 변수에 할당합니다.
        this.profile = document.getElementById('profile');
        this.repos = document.getElementById('repos');
    }

    // 사용자 정보를 화면에 표시하는 메서드입니다.
    showProfile(user) {
        // 프로필 정보 및 레포지토리 정보를 HTML 문자열로 생성하여 프로필 영역에 삽입합니다.
        this.profile.innerHTML = `
            <div class="card card-body mb-3">
                <div class="row">
                    <div class="col-md-3">
                        <img class="img-fluid mb-2" src="${user.avatar_url}">
                        <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block">View Profile</a>
                    </div>

                    <div class="col-md-9">
                        <span class="badge badge-primary">Public Repos : ${user.public_repos}</span>
                        <span class="badge badge-secondary">Public Gists : ${user.public_gists}</span>
                        <span class="badge badge-third">Followers : ${user.followers}</span>
                        <span class="badge badge-success">Following : ${user.following}</span>
                        <br><br>

                        <table class="table">
                            <tr class="list-group-item">
                                <td>Company: ${user.company}</td>
                            </tr>
                            <tr class="list-group-item">
                                <td>Website / Blog: ${user.blog}</td>
                            </tr>
                            <tr class="list-group-item">
                                <td>Location: ${user.location}</td>
                            </tr>
                            <tr class="list-group-item">
                                <td>Email: ${user.email}</td>
                            </tr>
                            <tr class="list-group-item">
                                <td>Member Since: ${user.created_at}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
        // 레포지토리 정보를 HTML 문자열로 생성하는 메서드
    showRepos(repos){
        // 레포지토리 정보를 HTML 문자열로 생성하여 repos 영역에 삽입합니다.
        this.repos.innerHTML = `
            <div class="repo">   
                <h3 class="page-heading mb-3">Latest Repos</h3>
                <table class="table">
                    <tbody>
                        ${repos.map(repo => `<tr><td class="table-repo"><a href="${repo.html_url}" target="_blank">${repo.name}</a></td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    

    getReposHTML(repos) {
        if (repos && repos.length > 0) {
            // 레포지토리가 있는 경우 리스트로 표시
            `
            <ul class="list-group">
                ${repos.map(repo => `<li class="list-group-item"><a href="${repo.html_url}" target="_blank">${repo.name}</a></li>`).join('')}
            </ul>
        `;
        }else {
            // 레포지토리가 없는 경우 메시지 표시
            return '<p>No repositories available</p>';
        }
    }
    
    // 레포지토리 아이템을 HTML 문자열로 생성하는 메서드
    getRepoItemHTML(repo) {
        return `<li class="list-group-item"><a href="${repo.html_url}" target="_blank">${repo.name}</a></li>`;
    }

    // 알림 메시지를 화면에 표시하는 메서드
    showAlert(message, classname) {
        // div 엘리먼트 생성
        const div = document.createElement('div');
        // 클래스 추가
        div.className = classname;
        // 텍스트 추가
        div.appendChild(document.createTextNode(message));

        // 부모 엘리먼트 가져오기
        const container = document.querySelector('.searchContainer');
        // 검색 상자 가져오기
        const search = document.querySelector('.search');
        // 알림 삽입
        container.insertBefore(div, search);

        // 1초 후에 알림을 지우는 타임아웃 설정
        setTimeout(() => {
            this.clearAlert();
        }, 1000);
    }

    // 프로필 영역을 지우는 메서드입니다.
    clearProfile() {
        this.profile.innerHTML = '';
    }
}