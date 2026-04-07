const API = {
    login: async (username, password) => {
        try {
            const response = await fetch(window.BASE_URL + 'UserDetailes/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        } catch (error) {
            console.error('API Login Error:', error);
            throw error;
        }
    },

    logout: async (id) => {
        try {
            const response = await fetch(window.BASE_URL + 'UserDetailes/logout.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            return await response.json();
        } catch (error) {
            console.error('API Logout Error:', error);
            throw error;
        }
    },

    balance: async (username, balance, game = 'G') => {
        try {
            let url = window.BASE_URL + `UserDetailes/balance.php?username=${username}&game=${game}`;
            if (balance) url += `&balance=${balance}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('API Balance Error:', error);
            throw error;
        }
    }
};

window.API = API;