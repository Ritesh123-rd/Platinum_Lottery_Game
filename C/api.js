// Extend the existing API object with H-game specific methods
Object.assign(window.API, {
    timer: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumC/GameApi/Timer.php');
            return await response.json();
        } catch (error) {
            console.error('API Timer Error (C):', error);
            throw error;
        }
    },

    insertData: async (data) => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumC/GameApi/InsertData.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API InsertData Error (C):', error);
            throw error;
        }
    },

    advancDrawTime: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumC/GameApi/AdvancDrawTime.php');
            return await response.json();
        } catch (error) {
            console.error('API AdvancDrawTime Error (C):', error);
            throw error;
        }
    },

    betHistory: async (username, date) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/BetHistory.php?username=${username}&record_date=${date}`);
            return await response.json();
        } catch (error) {
            console.error('API BetHistory Error (C):', error);
            throw error;
        }
    },

    reprintTicket: async (barcode, username) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/TicketViewAndPrint.php?barcodee=${barcode}&username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API Reprint Error (C):', error);
            throw error;
        }
    },

    currentDrawBetHistory: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/CurrentDrawBetHistory.php?username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API CurrentDrawBetHistory Error (C):', error);
            throw error;
        }
    },

    ticketCancel: async (id) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/CancleTicket.php?id=${id}`);
            return await response.json();
        } catch (error) {
            console.error('API TicketCancel Error (C):', error);
            throw error;
        }
    },

    resultDateWise: async (date) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/ResultDateWise.php?record_date=${date}`);
            return await response.json();
        } catch (error) {
            console.error('API ResultDateWise Error (C):', error);
            throw error;
        }
    },

    result: async () => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/Result.php`);
            return await response.json();
        } catch (error) {
            console.error('API Result Error (C):', error);
            throw error;
        }
    },

    lastDrawBetAmount: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/LastDrawBetAmount.php?username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API LastDrawBetAmount Error (C):', error);
            throw error;
        }
    },

    claimTicket: async (data) => {
        try {
            const response = await fetch(window.BASE_URL + 'PlatinumC/GameApi/ClaimTickets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API ClaimTicket Error (C):', error);
            throw error;
        }
    },

    lastTenResults: async function () {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/LastTenResults.php`);
            return await response.json();
        } catch (error) {
            console.error('API LastTenResults Error (C):', error);
            throw error;
        }
    },

    printTicket: async (barcode, username) => {
        try {
            const response = await fetch(window.BASE_URL + `PlatinumC/GameApi/PrintTickets.php?barcodee=${barcode}&username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API PrintTickets Error (C):', error);
            throw error;
        }
    }

});
