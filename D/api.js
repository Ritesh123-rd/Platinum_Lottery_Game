// Extend the existing API object with D-game specific methods
Object.assign(window.API, {
    insertData: async (data) => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumD/InsertData.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API InsertData Error (D):', error);
            throw error;
        }
    },

    currentDrawBetHistory: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumD/CurrentDrawBetHistory.php?username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API CurrentDrawBetHistory Error (D):', error);
            throw error;
        }
    },

    betHistory: async (username, recordDate) => {
        try {
            const url = window.BASE_URL + `PlatinumD/BetHistory.php?username=${username}&record_date=${recordDate}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('API BetHistory Error (D):', error);
            throw error;
        }
    },

    timer: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumD/Timer.php');
            return await response.json();
        } catch (error) {
            console.error('API Timer Error (D):', error);
            throw error;
        }
    },

    advancDrawTime: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumD/AdvancDrawTime.php');
            return await response.json();
        } catch (error) {
            console.error('API AdvancDrawTime Error (D):', error);
            throw error;
        }
    },

    cancleTicket: async (id) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumD/CancleTicket.php?id=${id}`);
            return await response.json();
        } catch (error) {
            console.error('API CancleTicket Error (D):', error);
            throw error;
        }
    },

    lastDrawBetAmount: async (username, last_bet_amount) => {
        try {
            let url = window.BASE_URL + `PlatinumD/LastDrawBetAmount.php?username=${username}`;
            if (last_bet_amount !== undefined && last_bet_amount !== null) {
                url += `&last_bet_amount=${last_bet_amount}`;
            }
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('API LastDrawBetAmount Error (D):', error);
            throw error;
        }
    },

    reprintTicket: async (barcode, username) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumD/TicketViewAndPrint.php?barcodee=${barcode}&username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API ReprintTicket Error (D):', error);
            throw error;
        }
    },
    
    claimTicket: async (barcode_number, username) => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumD/ClaimTickets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode_number, username })
            });
            return await response.json();
        } catch (error) {
            console.error('API ClaimTicket Error (D):', error);
            throw error;
        }
    },

    result: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumD/Result.php');
            return await response.json();
        } catch (error) {
            console.error('API Result Error (D):', error);
            throw error;
        }
    }
});
