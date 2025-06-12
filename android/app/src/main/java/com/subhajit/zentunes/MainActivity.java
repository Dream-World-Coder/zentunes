package com.subhajit.zentunes;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.ingageco.capacitormusiccontrols.CapacitorMusicControls;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    registerPlugin(CapacitorMusicControls.class);
  }
}
