// Teste do Dashboard Service
const testDashboard = async () => {
    try {
        // Simular login
        const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: 'admin',
                senha: 'YpP7sPnjw2G/TO5357wt1w=='
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login successful:', loginData);
        
        // Testar API do dashboard
        const dashboardResponse = await fetch('http://localhost:8000/api/v1/dashboard/resumo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.access_token}`
            }
        });
        
        const dashboardData = await dashboardResponse.json();
        console.log('Dashboard API Data:', dashboardData);
        
        // Simular o mapeamento do frontend
        const parseNumber = (value) => {
            if (typeof value === 'string') {
                return parseFloat(value.replace(',', '.')) || 0;
            }
            return Number(value) || 0;
        };
        
        const mappedData = {
            receitas: parseNumber(dashboardData.total_receitas),
            despesas: parseNumber(dashboardData.total_despesas),
            saldo: parseNumber(dashboardData.saldo),
            receitasPendentes: parseNumber(dashboardData.receitas_pendentes || 0),
            despesasPendentes: parseNumber(dashboardData.despesas_pendentes || 0)
        };
        
        console.log('Mapped Data:', mappedData);
        
        // Testar formatação de moeda
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        };
        
        console.log('Formatted Values:');
        console.log('Total de Receitas:', formatCurrency(mappedData.receitas));
        console.log('Total de Despesas:', formatCurrency(mappedData.despesas));
        console.log('Saldo Atual:', formatCurrency(mappedData.saldo));
        console.log('Receitas Pendentes:', formatCurrency(mappedData.receitasPendentes));
        console.log('Despesas Pendentes:', formatCurrency(mappedData.despesasPendentes));
        
        // Verificar se há valores NaN
        const hasNaN = Object.values(mappedData).some(value => isNaN(value));
        console.log('Has NaN values:', hasNaN);
        
        if (!hasNaN) {
            console.log('✅ Dashboard data is working correctly!');
        } else {
            console.log('❌ Dashboard data has NaN values!');
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
};

// Executar teste
testDashboard();