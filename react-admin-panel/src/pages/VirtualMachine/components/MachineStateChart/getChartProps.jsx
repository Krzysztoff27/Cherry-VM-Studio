/**
 * 
 * @param {string} resource - resource name e.g. CPU, RAM etc
 * @param {function} t - translate function passed from i18next library
 */
const getLabel = (resource, t) => t ? t('machine.graph.resource-used', {resource: resource, ns: 'pages'}) : null;

/**
 * 
 * @param {object} currentState - machine state object from the API
 * @param {function} t - translate function passed from i18next library
 * @returns 
 */
const getChartProps = (currentState = {}, t) => ({
        CPU: {
            yAxisProps: { domain: [0, 100], width: 80 },
            series: [{ name: 'cpu', color: 'indigo.6', label: getLabel('CPU', t)}],
            unit: '%'
        },
        RAM: {
            yAxisProps: currentState.ram_max ? { domain: [0, currentState.ram_max], tickCount: 12, width: 80 } : undefined,
            series: [{ name: 'ram_used', color: 'teal.6', label: getLabel('RAM', t)}],
            unit: ' MB'
        }
    }
);

export default getChartProps;