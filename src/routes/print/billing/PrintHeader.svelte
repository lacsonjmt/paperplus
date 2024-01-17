<script lang="ts">
    export let patientInformation: any;
    export let institutionName: string;
</script>

<!--Header & Patient Info-->
<table class="print w-full border-collapse table-fixed border-all">
    <tbody>
        <tr class="label">
            <td  colspan=3 class="text-left text-print-xs ">Patient</td>
            <td  colspan=6 class="text-lg text-center non-italic border-bottom">Billing Report</td>
            <td  colspan=3 rowspan=2 class="text-left text-print-xs border-bottom">
                <center>
                    <img alt="print logo" class="printLogo" src="/img/logo.png" width="128px"/>
                </center>
            </td>
        </tr>
        <tr class="dynamic-data">
            <td colspan=3 class="text-lg text-left">
                {patientInformation.givenName} {patientInformation.familyName}
            </td>
            <td colspan=6 class="text-lg text-center ">{institutionName}</td>
    
        </tr>

        <tr class="label text-print-xs">
            <td colspan=2>HN</td>
            <td colspan=2>AN</td>
            <td>Date of Birth</td>
            <td>Age</td>
            <td>Blood Type</td>
            <td>ASA Status</td>
            <td>Technique</td>
            <td>Gender</td>
            <td>Weight</td>
            <td>Height</td>
        </tr>

        <tr class="dynamic-data">
            <td colspan=2>{patientInformation.HN}</td>
            <td colspan=2>{patientInformation.AN}</td>
            <td>{patientInformation.dob}</td>
            <td>{patientInformation.age}</td>
            <td>{patientInformation.bloodType}</td>
            <td>{patientInformation.asaStatus}</td>
            <td>{patientInformation.technique}</td>
            <td>{patientInformation.gender}</td>
            <td>{patientInformation.weight}</td>
            <td>{patientInformation.height}</td>
        
        </tr>

        <tr class="label text-print-xs">
            <td colspan=4>Diagnosis</td>
            <td colspan=2>Case Types</td>
            <td colspan=2>Anaesthesist</td>
            <td colspan=2>Allergies</td>
        </tr>

        <tr class="dynamic-data">
            <td colspan=4>{patientInformation.diagnosis}</td>
            <td colspan=2>{patientInformation.caseType}</td>
            <td colspan=2>{patientInformation.anaesthesist}</td>
            <td colspan=2 rowspan=3>{patientInformation.allergy}</td>
        </tr>

        <tr class="label text-print-xs">
            <td colspan=4>Procedure</td>
            <td colspan=2>Bed</td>
            <td colspan=2>Surgeon</td>
        </tr>

        <tr class="dynamic-data">
            <td colspan=4>{patientInformation.procedure}</td>
            <td colspan=2>{patientInformation.bed}</td>
            <td colspan=2>{patientInformation.surgeon}</td>
        </tr>

        <tr class="label text-print-xs">
            <td colspan=2>Hospital Admit Date</td>
            <td colspan=2>In/Out OR Duration</td>
            <td colspan=2>Anaesthesia Duration</td>
            <td colspan=2>Surgery Duration</td>
            <td colspan=2>Induction/Reversal Duration</td>
        </tr>

        <tr class="dynamic-data">
            <td colspan=2>{patientInformation.hospitalAdmitDate}</td>
            <td colspan=2>{patientInformation.InOutORDuration}</td>
            <td colspan=2>{patientInformation.anaesthesiaDuration}</td>
            <td colspan=2>{patientInformation.surgeryDuration}</td>
            <td colspan=2>{patientInformation.inductionReversalDuration}</td>
        </tr>
    </tbody>
</table>
<!--END of Header-->