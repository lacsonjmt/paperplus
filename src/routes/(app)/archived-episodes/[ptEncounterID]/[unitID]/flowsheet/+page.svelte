<script>
	import FlowSheet from "$lib/components/FlowSheet.svelte";
    export let data;
</script>
<div class="text-white">
    <div class="z-10">
        <main class="pl-2 p-1 bg-pplus-gray">
            <div class="headerPatientInfo grid grid-cols-12 gap-0 text-xs text-pplus-dark-gray">
                <div class="col-span-2">
                    <div class="col-span-1">
                        <span>HN: {data.archivedEpisode.uin}</span>
                    </div>
                </div>
                <div class="col-span-2">
                    <div class="col-span-1">
                        <span>Gender: {data.archivedEpisode.gender || ''}</span>
                    </div>
                    <div class="col-span-1">
                        <span>Age: {data.archivedEpisode.age || ''}</span>
                    </div>
                </div>
                <div class="col-span-2">
                    <div class="col-span-1">
                        <span>Weight(kg:) {data.archivedEpisode.weight || ''}</span>
                    </div>
                    <div class="col-span-1">
                        <span>BMI: {data.archivedEpisode.bmi || ''}</span>
                    </div>
                </div>
                <div class="col-span-2">
                    <div class="grid grid-cols-4">
                        <div>
                            <span class="intro-x flex items-center">
                                <img class:grayscale={!data.archivedEpisode.allergy}
                                    alt="allergy icon"
                                    src="/img/allergy.png"
                                    width="32px"
                                />
                            </span>
                        </div>
                        <div>
                            <span class="intro-x flex items-center">
                                <img class:grayscale={!data.archivedEpisode.precaution}
                                    alt="precaution icon"
                                    src="/img/precaution.png"
                                    width="32px"
                                />
                            </span>
                        </div>
                    </div>
                </div>
                <div class="col-span-4 flex justify-end pr-4">
                    <div class="grid grid-cols-9 gap-4">
                        <div class="col-span-7 text-lg">
                           {data.archivedEpisode.patientName}
                        </div>
                        <div class="col-span-2">
                            <a data-sveltekit-reload href="/">
                                <img alt="xMark icon" title="Exit" src="/img/xMark.png" width="32px" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <div class="grid grid-cols-12 pr-6 bg-white text-black border-b-2">
        <div class="grid content-center col-span-7">
            <div class="tab-list">
                <div class="grid grid-cols-12 gap-0 text-center ">
                    &nbsp;
                </div>
                <div class="grid grid-cols-12 gap-0 text-center">
                    &nbsp;
                </div>
            </div>
        </div>
    </div>
</div>
<FlowSheet
    ptEncounterID={data.ptEncounterID}
    unitID={data.unitID}
    intervalMinutes={parseInt(data.FLOWSHEET_INTERVAL_MINUTES)}
    autochartMinutes={parseInt(data.FLOWSHEET_AUTOCHART_MINUTES)}
    isEditable={false} />