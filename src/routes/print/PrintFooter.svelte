<script lang="ts">

	import moment from "moment";

    export let page: number = 0;
    export let totalPages: number = 0;
</script>
<table class="print w-full border-collapse table-fixed border-left border-right mt-4 border-top">
    <tbody>
        <tr class="label">
            <td  colspan=2 class="text-left text-print-xs ">Signature</td>
            <td  colspan=2 class="text-left text-print-xs ">Date</td>
            <td  colspan=2 class="text-left text-print-xs">Date Printed</td>
        </tr>
        <tr class="dynamic-data">
            <td  colspan=2 rowspan=5 class="text-left"></td>
            <td  colspan=2 rowspan=3 class="text-left text-print-xs "></td>
            <td  colspan=2 class="text-right">
                {moment().format('DD-MMM-Y HH:mm')}
            </td>
        </tr>

        <tr class="label">
            <td  colspan=2 class="text-left text-print-xs">Page</td>
        </tr>

        <tr class="dynamic-data">
            <td  colspan=2 class="text-right">{page} of {totalPages}</td>
        </tr>
    </tbody>
</table>