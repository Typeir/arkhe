<!--
@component
Test fixture: a SheetField whose body is a search box and a Done button that
shuts the sheet.
-->
<script lang="ts">
  import SheetField from '../../../packages/svelte/src/SheetField.svelte';

  /**
   * Props of SheetProbe.
   *
   * @interface Props
   * @property {string} [text] - Choice shown on the button.
   * @property {string} [placeholder] - Shown without a choice.
   * @property {string} [name] - Form field name.
   * @property {string | null} [value] - Submitted value.
   */
  interface Props {
    text?: string;
    placeholder?: string;
    name?: string;
    value?: string | null;
  }

  let props: Props = $props();
</script>

<SheetField label="School" {...props}>
  {#snippet children(close)}
    <input aria-label="Find" />
    <button type="button" onclick={close}>Done</button>
  {/snippet}
</SheetField>
