Object.assign(window.API, {
    insertData: async (data) => {
        try {
            const response = await fetch(window.BASE_URL + 'Platinum3D/InsertData.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API InsertData Error (3D):', error);
            throw error;
        }
    },

    advancDrawTime: async () => {
        try {
            const response = await fetch(window.BASE_URL + 'Platinum3D/AdvancDrawTime.php');
            return await response.json();
        } catch (error) {
            console.error('API AdvancDrawTime Error (3D):', error);
            throw error;
        }
    },

    betHistory: async (username, date) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum3D/BetHistory.php?username=${username}&record_date=${date}`);
            return await response.json();
        } catch (error) {
            console.error('API BetHistory Error (3D):', error);
            throw error;
        }
    },

    currentDrawBetHistory: async (username) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum3D/CurrentDrawBetHistory.php?username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API CurrentDrawBetHistory Error (3D):', error);
            throw error;
        }
    },

    ticketCancel: async (id) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum3D/CancleTicket.php?id=${id}`);
            return await response.json();
        } catch (error) {
            console.error('API TicketCancel Error (3D):', error);
            throw error;
        }
    },

    resultDateWise: async (date) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum3D/ResultDateWise.php?record_date=${date}`);
            return await response.json();
        } catch (error) {
            console.error('API ResultDateWise Error (3D):', error);
            throw error;
        }
    },

    printTicket: async (barcode, username) => {
        try {
            const response = await fetch(window.BASE_URL + `Platinum3D/PrintTickets.php?barcodee=${barcode}&username=${username}`);
            return await response.json();
        } catch (error) {
            console.error('API PrintTickets Error (3D):', error);
            throw error;
        }
    },
    
    claimTickets: async (data) => {
        try {
            const response = await fetch(window.BASE_URL + 'Platinum3D/ClaimTickets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API ClaimTickets Error (3D):', error);
            throw error;
        }
    }
});
