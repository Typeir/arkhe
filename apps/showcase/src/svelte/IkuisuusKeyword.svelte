<!--
@component
One keyword of the Ikuisuus clone: Arkhé's HoverCard with Ikuisuus's
timings and card body. Keywords in a card nest.
-->
<script lang="ts">
  import { HoverCard, Icon } from '@arkhe/svelte';
  import {
    IKUISUUS_DELAYS,
    IKUISUUS_KEYWORDS,
    ikuisuusString,
    type IkuisuusTerm,
    ikuisuusWidth,
  } from '../ikuisuus';
  import Self from './IkuisuusKeyword.svelte';

  /**
   * Props of IkuisuusKeyword.
   *
   * @interface Props
   * @property {IkuisuusTerm} term - Keyword.
   * @property {string} [display] - Text as written; defaults to the keyword's.
   */
  interface Props {
    term: IkuisuusTerm;
    display?: string;
  }

  let { term, display }: Props = $props();
  const entry = $derived(IKUISUUS_KEYWORDS[term]);
</script>

{#snippet card()}
  <div class="ik-card">
    <div class="ik-card-heading">
      <h3 class="ik-card-title">{entry.title}</h3>
      <a
        class="ik-card-link"
        href={entry.href}
        aria-label={ikuisuusString('openRule', entry.title)}
        ><Icon name="external-link" /></a>
    </div>
    <div class="ik-blurb">
      {#if term === 'burning'}
        <p>Sufferers are on fire and take ongoing heat damage.</p>
        <ul>
          <li>
            At the start of each of their turns, sufferers take <strong
              >1d10 fire.</strong>
          </li>
          <li>
            Sufferers can use a <strong>Major Action</strong> to
            <strong>extinguish the flames</strong> by dropping prone, rolling,
            or smothering themselves.
            <ul>
              <li>
                Doing so <strong
                  >automatically ends the <Self
                    term="burning"
                    display="burning" /></strong
                >, and they end their turn
                <strong><Self term="prone" />.</strong>
              </li>
            </ul>
          </li>
          <li>
            Another creature within 1 stride may also use a <strong
              >Major Action</strong> to extinguish the flames.
          </li>
          <li>
            While burning, sufferers shed <strong
              >bright light in a 2-stride radius</strong>
            and
            <strong>dim light for another 2 strides.</strong>
          </li>
        </ul>
      {:else}
        <ul>
          <li>
            Sufferers’ only movement option is to <strong>crawl</strong>, unless
            they <strong>stand up</strong> and end the condition.
          </li>
          <li>They have <strong>disadvantage on attack rolls</strong>.</li>
          <li>
            <strong>Attack rolls</strong> against them have
            <strong>advantage</strong> if the attacker is within 1 stride;
            otherwise, those rolls have <strong>disadvantage</strong>.
          </li>
        </ul>
      {/if}
    </div>
  </div>
{/snippet}

<HoverCard
  title={entry.title}
  href={entry.href}
  headerLink={false}
  pinnable={false}
  placement="top"
  openDelay={IKUISUUS_DELAYS.open}
  closeDelay={IKUISUUS_DELAYS.close}
  width={ikuisuusWidth(entry.source)}
  content={card}>{display ?? entry.display}</HoverCard>
