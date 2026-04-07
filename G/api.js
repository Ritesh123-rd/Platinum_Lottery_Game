// Extend the existing API object with G-game specific methods
Object.assign(window.API, {
    insertData: async (data) => {
        try {
            const response = await fetch(window.BASE_URL + 'G/GameApi/InsertData.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API InsertData Error:', error);
            throw error;
        }
    },

    currentDrawBetHistory: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + `G/GameApi/CurrentDrawBetHistory.php?username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API CurrentDrawBetHistory Error:', error);
            throw error;
        }
    },

    betHistory: async (username, recordDate) => {
        try {
            const url = window.BASE_URL + `G/GameApi/BetHistory.php?username=${username}&record_date=${recordDate}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('API BetHistory Error:', error);
            throw error;
        }
    },

    timer: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'G/GameApi/Timer.php');
            return await response.json();
        } catch (error) {
            console.error('API Timer Error:', error);
            throw error;
        }
    },

    advancDrawTime: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'G/GameApi/AdvancDrawTime.php');
            return await response.json();
        } catch (error) {
            console.error('API AdvancDrawTime Error:', error);
            throw error;
        }
    },

    cancleTicket: async (id) => {
        try {
            const response = await fetch(window.BASE_URL + `G/GameApi/CancleTicket.php?id=${id}`);
            return await response.json();
        } catch (error) {
            console.error('API CancleTicket Error:', error);
            throw error;
        }
    },

    lastDrawBetAmount: async (username, last_bet_amount) => {
        try {
            let url = window.BASE_URL + `G/GameApi/LastDrawBetAmount.php?username=${username}`;
            if (last_bet_amount !== undefined && last_bet_amount !== null) {
                url += `&last_bet_amount=${last_bet_amount}`;
            }
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('API LastDrawBetAmount Error:', error);
            throw error;
        }
    },

    reprintTicket: async (barcode, username) => {
        try {
            const response = await fetch(window.BASE_URL + `G/GameApi/TicketViewAndPrint.php?barcodee=${barcode}&username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API ReprintTicket Error:', error);
            throw error;
        }
    },
    
    claimTicket: async (barcode_number, username) => {
        try {
            const response = await fetch(window.BASE_URL + 'G/GameApi/ClaimTickets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode_number, username })
            });
            return await response.json();
        } catch (error) {
            console.error('API ClaimTicket Error:', error);
            throw error;
        }
    },

    result: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'G/GameApi/Result.php');
            return await response.json();
        } catch (error) {
            console.error('API Result Error:', error);
            throw error;
        }
    }
});
