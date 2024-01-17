<svelte:head>
    <title>Paper+ Billing</title>
    <meta name="Billing" content="Paper+" />
</svelte:head>

<script lang="ts">
	import PrintFooter from '../PrintFooter.svelte';
    import PrintHeader from './PrintHeader.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { stringify } from 'postcss';

    const ptEncounterID = $page.url.searchParams.get('ptEncounterID');
    const unitID = $page.url.searchParams.get('unitID');
    const userID = $page.url.searchParams.get('user.userID');

    let patientInformation: any = {};
    let institutionName: string = '';

    let billings: any[] = [];

    const TARGET_API_CALL_COUNT = 5;
    let currentApiCallCount = 0;

    onMount(async () => {
        fetch('/api/institution')
            .then(async a => {
                const institution = await a.json();
                institutionName = institution[0] ? institution[0].institution : ''; 
                currentApiCallCount++;
            });
        fetch('/api/billing'
                + `?ptEncounterID=${ptEncounterID}`
                + `&unitID=${unitID}`
                + `&userID=${userID}`)
            .then(async response => {
                billings = await response.json();
                console.log(billings)
                currentApiCallCount++;
            });
        fetch('/api/charted-catalog'
                + '?parentID=A6634863-D81D-4950-97E1-F17604135252'
                + `&unitID=${unitID}`
                + `&ptEncounterID=${ptEncounterID}`)
            .then(async response => {
                const result = await response.json();
                patientInformation.HN = result.find((a: any) => a.catalog.startsWith('HN'))?.value;
                patientInformation.AN = result.find((a: any) => a.catalog.startsWith('AN'))?.value;
                patientInformation.givenName = result.find((a: any) => a.catalog.startsWith('Given Name'))?.value;
                patientInformation.familyName = result.find((a: any) => a.catalog.startsWith('Family Name'))?.value;
                patientInformation.dob = result.find((a: any) => a.catalog.startsWith('Date of Birth'))?.value;
                // patientInformation.dob =  patientInformation.dob?.split(' ')[0];
                patientInformation.dob = new Date(patientInformation.dob).toLocaleDateString();
                patientInformation.dob = patientInformation.dob.split('/').join('-');
                patientInformation.age = result.find((a: any) => a.catalog.startsWith('Age'))?.value;
                patientInformation.bloodType = result.find((a: any) => a.catalog.startsWith('Blood Type'))?.value;
                patientInformation.weight = result.find((a: any) => a.catalog.startsWith('Weight'))?.value;
                patientInformation.height = result.find((a: any) => a.catalog.startsWith('Height'))?.value;
                patientInformation.gender = result.find((a: any) => a.catalog.startsWith('Gender'))?.value;
                patientInformation.allergy = result.find((a: any) => a.catalog.startsWith('Allergy'))?.value;
                patientInformation.caseType = result.find((a: any) => a.catalog.startsWith('Case Type'))?.value;
                patientInformation.anaesthesist = result.find((a: any) => a.catalog.startsWith('Anaesthetist'))?.value;
                patientInformation.surgeon = result.find((a: any) => a.catalog.startsWith('Surgeon'))?.value;
                patientInformation.bed = result.find((a: any) => a.catalog.startsWith('Bed'))?.value;
                patientInformation.hospitalAdmitDate = result.find((a: any) => a.catalog.startsWith('Hospital Admission Date'))?.value;
                patientInformation.asaStatus = result.find((a: any) => a.catalog.startsWith('ASA status'))?.value;
                patientInformation.technique = result.find((a: any) => a.catalog.startsWith('Technique'))?.value;
                patientInformation.InOutORDuration = result.find((a: any) => a.catalog.startsWith('In/Out OR Duration'))?.value;
                patientInformation.surgeryDuration = result.find((a: any) => a.catalog.startsWith('Surgery Duration'))?.value;
                patientInformation.anaesthesiaDuration = result.find((a: any) => a.catalog.startsWith('Anaesthesia Duration'))?.value;
                patientInformation.inductionReversalDuration = result.find((a: any) => a.catalog.startsWith('Induction/Reversal Duration'))?.value;

                currentApiCallCount++;
            });
            
        fetch('/api/charted-catalog'
                + '?parentID=20C11519-FCC8-487C-A1EF-B6904BD505E7'
                + `&unitID=${unitID}`
                + `&ptEncounterID=${ptEncounterID}`)
            .then(async response => {
                const result = await response.json();
                if(result.length) {
                    patientInformation.diagnosis = result[0].value;
                }
                currentApiCallCount++;
            });
        fetch('/api/charted-catalog'
                + '?parentID=98594C4F-FC80-4580-98A4-493E3470D05B'
                + `&unitID=${unitID}`
                + `&ptEncounterID=${ptEncounterID}`)
            .then(async response => {
                const result = await response.json();
                if(result.length) {
                    patientInformation.procedure = result[0].value;
                }
                currentApiCallCount++;
            });
    });

    $: if(currentApiCallCount == TARGET_API_CALL_COUNT) {
        setTimeout(() => {
            window.print();
            history.back();
        }, 500);
    }
</script>
<main class="min-h-screen print">
        <div>
            <PrintHeader {patientInformation} {institutionName} />
            <div class="h-100 mt-2">
                <table class="print w-full border-collapse table-fixed text-center mt-4"> 
                    <div class="columns-2 w-full px-4">
                        <thead class="text-print-xs w-full border-top">
                            <tr class="border-left border-right text-print-xs font-bold bg-white">
                                <td width="20%">No.</td>
                                <td width="40%">Item</td>
                                <td width="10%">Quantity</td>
                                <td width="15%">Unit Price</td>
                                <td width="15%">Total</td>
                            </tr>
                        </thead>
                    
                        {#each [...new Set(billings.map(a => a.group))] as group}
                      
                            <thead class="text-print-xs w-full">
                                <tr class="border-all text-print-xs bg-white">
                                    <td colspan="5" class="font-bold">{group}</td>
                                </tr>
                             </thead>
                
                            <tbody class="text-print-xs w-full page-break-inside-avoid">
                                    {#each billings.filter(a => a.group == group) as item, i}
                                        <tr class="border-all">
                                            <td>{i + 1}</td>
                                            <td class="text-left">{item.catalog}</td>
                                            <td>{item.qty}</td>
                                            <td>&nbsp;</td>
                                            <td>&nbsp;</td>
                                        </tr>
                                    {/each}
                                    <tr class="subTotal border-all">
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td class="font-bold">Subtotal</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                    </tr>
                            </tbody>
                        {/each}
                    </div>
                </table> 
                <table class="w-full border-collapse table-fixed mt-4 text-center">
                    <tfoot>
                    <tr class="text-print-md mx-4">
                        <td class="font-bold" width="78%">&nbsp;</td>
                        <td class=" font-bold text-left">Total: _____________________</td>
                    </tr>
                    </tfoot>
                </table>
            </div>
            <div class="mt-2">
                <PrintFooter page={1} totalPages={1} />
            </div>
        </div>
</main>