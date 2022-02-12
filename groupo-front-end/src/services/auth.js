//--- Méthode authentication par récupération du token ---//

export default function auth() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
}