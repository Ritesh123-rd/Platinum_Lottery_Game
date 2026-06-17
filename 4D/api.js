// Extend the existing API object with 4D-game specific methods
Object.assign(window.API, {

    timer: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'Platinum4D/Timer.php');
            return await response.json();
        } catch (error) { 
            console.error('API Timer Error:', error);
            throw error;
        }
    },

    insertData: async (data) => {
        try {
            console.log('Sending 4D Bet Payload:', data);
            const response = await fetch(window.BASE_URL + 'Platinum4D/InsertData.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log('4D Bet Response:', result);
            return result;
        } catch (error) {
            console.error('API InsertData Error (4D):', error);
            throw error;
        }
    },

    getAdvanceDrawTimes: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'Platinum4D/AdvancDrawTime.php');
            return await response.json();
        } catch (error) {
            console.error('API AdvancDrawTime Error:', error);
            throw error;
        }
    },

    betHistory: async (username, date) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum4D/BetHistory.php?username=${username}&record_date=${date}`);
            return await response.json();
        } catch (error) {
            console.error('API BetHistory Error (4D):', error);
            throw error;
        }
    },

    reprintTicket: async (barcode, username) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum4D/TicketViewAndPrint.php?barcodee=${barcode}&username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API Reprint Error (4D):', error);
            throw error;
        }
    },

    currentDrawBetHistory: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum4D/CurrentDrawBetHistory.php?username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API CurrentDrawBetHistory Error (4D):', error);
            throw error;
        }
    },

    ticketCancel: async (id) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum4D/CancleTicket.php?id=${id}`);
            return await response.json();
        } catch (error) {
            console.error('API TicketCancel Error (4D):', error);
            throw error;
        }
    },

    result: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'Platinum4D/Result.php');
            return await response.json();
        } catch (error) {
            console.error('API Result Error (4D):', error);
            throw error;
        }
    },

    resultDateWise: async (date) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum4D/ResultDateWise.php?record_date=${date}`);
            return await response.json();
        } catch (error) {
            console.error('API ResultDateWise Error (4D):', error);
            throw error;
        }
    },

    claimTickets: async (data) => {
        try {
            const response = await fetch(window.BASE_URL + 'Platinum4D/ClaimTickets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API ClaimTickets Error (4D):', error);
            throw error;
        }
    }

});
