<script lang="ts">
    export let width = "24";
    export let height = "24";
    export let color = "currentColor"; // Usa el color del contexto
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    {width}
    {height}
    fill="none"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
>
    <path d="M5 3l14 9-14 9V3z"></path>
</svg>